const mongoose = require('mongoose');

const shippingRateConfigSchema = new mongoose.Schema({
  zone: {
    type: String,
    enum: ["local", "regional", "metro", "national", "remote"],
    required: true,
    unique: true
  },
  baseRate: { type: Number, required: true, default: 50 },
  extraRatePer500g: { type: Number, required: true, default: 50 },
  codCharge: { type: Number, required: true, default: 50 },
  codAvailableDefault: { type: Boolean, default: true },
  freeShippingThreshold: { type: Number, required: true, default: 1500 }
}, { timestamps: true });

module.exports = mongoose.model('ShippingRateConfig', shippingRateConfigSchema);
