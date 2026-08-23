const mongoose = require('mongoose');

const serviceablePincodeSchema = new mongoose.Schema({
  pincode: {
    type: String,
    required: true,
    unique: true,
    index: true,
    match: [/^[0-9]{6}$/, 'Please provide a valid 6-digit pincode']
  },
  city: { type: String, required: true },
  state: { type: String, required: true },
  zone: {
    type: String,
    enum: ["local", "regional", "metro", "national", "remote"],
    required: true
  },
  isServiceable: { type: Boolean, default: true },
  codAvailable: { type: Boolean, default: true },
  estimatedDays: { type: Number, required: true, min: 1 }
}, { timestamps: true });

module.exports = mongoose.model('ServiceablePincode', serviceablePincodeSchema);
