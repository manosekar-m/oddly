const Order = require('../models/Order');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');
const { v4: uuidv4 } = require('uuid');

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
    const paymentId = `UPI-${uuidv4().slice(0, 8).toUpperCase()}`;

    // Handle payment screenshot if uploaded
    const paymentScreenshot = req.file ? req.file.path : '';

    const order = await Order.create({
      user: req.user._id,
      items,
      totalAmount,
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
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { orderStatus: req.body.orderStatus },
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
