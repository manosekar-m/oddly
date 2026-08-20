const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name: String,
    image: String,
    size: String,
    quantity: Number,
    price: Number,
  }],
  totalAmount: { type: Number, required: true },
  shippingAddress: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    district: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
  },
  mobile: { type: String, required: true },
  paymentMethod: { type: String, default: 'UPI' },
  paymentId: { type: String, default: '' },
  transactionId: { type: String, default: '' },
  paymentScreenshot: { type: String, default: '' },
  razorpayOrderId: { type: String, default: '' },
  razorpayPaymentId: { type: String, default: '' },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
  orderStatus: { type: String, enum: ['placed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'], default: 'placed' },
  deliveredAt: { type: Date },
  returnRequested: { type: Boolean, default: false },
  returnReason: { type: String, default: '' },
  returnStatus: { type: String, enum: ['none', 'requested', 'approved', 'rejected'], default: 'none' },
  coupon: { type: mongoose.Schema.Types.ObjectId, ref: 'Coupon' },
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
