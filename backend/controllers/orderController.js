const Order = require('../models/Order');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');
const { v4: uuidv4 } = require('uuid');
const { calculateShippingRate } = require('../utils/delivery');

exports.placeOrder = async (req, res) => {
  try {
    let { items, shippingAddress, mobile, paymentMethod, transactionId, totalAmount, couponId, razorpayOrderId, razorpayPaymentId } = req.body;
    // Sanitize couponId — FormData may send the string "undefined"
    if (!couponId || couponId === 'undefined' || couponId === 'null') couponId = null;

    // Parse items if sent as JSON string (happens with FormData)
    if (typeof items === 'string') {
      try { items = JSON.parse(items); } catch { return res.status(400).json({ message: 'Invalid items data' }); }
    }
    // Parse shippingAddress if sent as JSON string
    if (typeof shippingAddress === 'string') {
      try { shippingAddress = JSON.parse(shippingAddress); } catch { return res.status(400).json({ message: 'Invalid address data' }); }
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'No items in order' });
    }

    if (paymentMethod !== 'Razorpay') {
      const hasTransactionId = transactionId && transactionId.trim() !== '';
      const hasScreenshot = !!req.file;
      
      if (!hasTransactionId && !hasScreenshot) {
        return res.status(400).json({ message: 'Please provide either a Transaction ID or a Payment Screenshot for UPI orders.' });
      }
    }

    // Validate stock and deduct
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) return res.status(404).json({ message: `Product not found: ${item.product}` });
      const sizeObj = product.sizes.find(s => s.size === item.size);
      if (!sizeObj || sizeObj.quantity < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for size ${item.size} of ${product.name}` });
      }
      sizeObj.quantity -= item.quantity;
      await product.save();
    }

    if (!totalAmount) {
      totalAmount = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    }
    
    // Calculate Shipping Rate
    const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
    const baseWeight = 500;
    const totalWeightInGrams = totalItems <= 3 ? baseWeight : baseWeight + ((totalItems - 3) * 200);
    
    const deliveryData = await calculateShippingRate(
      shippingAddress.pincode,
      totalWeightInGrams,
      totalAmount,
      paymentMethod
    );

    if (!deliveryData.serviceable) {
      return res.status(400).json({ message: deliveryData.message || 'Delivery not available for this pincode' });
    }

    const finalAmount = totalAmount + deliveryData.shippingCost;
    
    const paymentId = `UPI-${uuidv4().slice(0, 8).toUpperCase()}`;

    // Handle payment screenshot if uploaded
    const paymentScreenshot = req.file ? req.file.path : '';

    const order = await Order.create({
      user: req.user._id,
      items,
      totalAmount: finalAmount,
      shippingCost: deliveryData.shippingCost,
      codCharge: deliveryData.codCharge || 0,
      estimatedDeliveryDate: deliveryData.estimatedDeliveryDate,
      shippingAddress,
      mobile,
      paymentMethod: paymentMethod || 'UPI',
      paymentId,
      transactionId: transactionId ? transactionId.trim() : '',
      paymentScreenshot,
      razorpayOrderId: razorpayOrderId || '',
      razorpayPaymentId: razorpayPaymentId || '',
      paymentStatus: paymentMethod === 'Razorpay' ? 'paid' : 'pending',
      orderStatus: 'placed',
      coupon: couponId || undefined
    });

    // If coupon used, increment its count
    if (couponId) {
      await Coupon.findByIdAndUpdate(couponId, { $inc: { usedCount: 1 } });
    }

    res.status(201).json(order);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).populate('coupon', 'code').sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate('user', 'name email mobile').populate('coupon', 'code').sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email mobile').populate('coupon', 'code');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const updateData = { orderStatus: req.body.orderStatus };
    if (req.body.orderStatus === 'delivered') {
      updateData.deliveredAt = new Date();
    }
    
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.updatePaymentStatus = async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { paymentStatus: req.body.paymentStatus },
      { new: true }
    );
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.requestReturn = async (req, res) => {
  try {
    const { returnReason } = req.body;
    if (!returnReason) return res.status(400).json({ message: 'Return reason is mandatory' });

    const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.orderStatus !== 'delivered') return res.status(400).json({ message: 'Only delivered orders can be returned' });
    
    if (!order.deliveredAt) return res.status(400).json({ message: 'Delivery date not recorded' });

    const diffTime = Math.abs(new Date() - order.deliveredAt);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays > 4) {
      return res.status(400).json({ message: 'Return window of 4 days has expired' });
    }

    order.returnRequested = true;
    order.returnReason = returnReason;
    order.returnStatus = 'requested';
    await order.save();

    res.json(order);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.updateReturnStatus = async (req, res) => {
  try {
    const { returnStatus } = req.body;
    const updateData = { returnStatus };
    if (returnStatus === 'approved') {
      updateData.orderStatus = 'returned';
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json({ message: 'Order deleted successfully' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

