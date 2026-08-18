const mongoose = require('mongoose');

const sizeSchema = new mongoose.Schema({
  size: { type: String, enum: ['S', 'M', 'L', 'XL', 'XXL', 'XXXL'], required: true },
  quantity: { type: Number, required: true, default: 0 },
});

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  price: { type: Number, required: true },
  discountedPrice: { type: Number, required: true },
  images: [{ type: String }],
  sizes: [sizeSchema],
  category: { type: String, default: 'T-Shirt' },
  isNewArrival: { type: Boolean, default: true },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
