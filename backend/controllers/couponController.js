const Coupon = require('../models/Coupon');

// Admin: Get all coupons
exports.getCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort('-createdAt');
    res.json(coupons);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// Admin: Create coupon
exports.createCoupon = async (req, res) => {
  try {
    const payload = { ...req.body };
    // Mongoose fails to cast empty strings to Number
    if (payload.maxDiscount === '') delete payload.maxDiscount;
    if (payload.minPurchase === '') payload.minPurchase = 0;
    if (payload.usageLimit === '') payload.usageLimit = 100;
    
    const coupon = await Coupon.create(payload);
    res.status(201).json(coupon);
  } catch (err) { res.status(400).json({ message: err.message }); }
};

// Admin: Delete coupon
exports.deleteCoupon = async (req, res) => {
  try {
    await Coupon.findByIdAndDelete(req.params.id);
    res.json({ message: 'Coupon deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// Public: Validate coupon
exports.validateCoupon = async (req, res) => {
  try {
    const { code, cartTotal } = req.body;
    const coupon = await Coupon.findOne({ code, isActive: true });

    if (!coupon) return res.status(404).json({ message: 'Invalid or expired coupon code' });
    if (new Date(coupon.expiryDate) < new Date()) return res.status(400).json({ message: 'Coupon has expired' });
    if (cartTotal < coupon.minPurchase) return res.status(400).json({ message: `Minimum purchase of ₹${coupon.minPurchase} required` });
    if (coupon.usedCount >= coupon.usageLimit) return res.status(400).json({ message: 'Coupon usage limit reached' });

    let discount = 0;
    if (coupon.discountType === 'percentage') {
      discount = (cartTotal * coupon.discountAmount) / 100;
      if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
    } else {
      discount = coupon.discountAmount;
    }

    res.json({ 
      message: 'Coupon applied!', 
      discount, 
      code: coupon.code,
      _id: coupon._id,
      discountType: coupon.discountType,
      discountAmount: coupon.discountAmount
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
