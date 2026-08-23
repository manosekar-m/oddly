const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  marqueeMessage: {
    type: String,
    default: ''
  },
  warehousePincode: {
    type: String,
    default: '600001'
  }
}, { timestamps: true });

module.exports = mongoose.model('Settings', settingsSchema);
