const ServiceablePincode = require('../models/ServiceablePincode');
const ShippingRateConfig = require('../models/ShippingRateConfig');

// --- Pincode Management ---
exports.getPincodes = async (req, res) => {
  try {
    const pincodes = await ServiceablePincode.find().sort({ createdAt: -1 });
    res.json(pincodes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.addPincode = async (req, res) => {
  try {
    const pincode = new ServiceablePincode(req.body);
    await pincode.save();
    res.status(201).json(pincode);
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ message: 'Pincode already exists' });
    res.status(400).json({ message: err.message });
  }
};

exports.updatePincode = async (req, res) => {
  try {
    const pincode = await ServiceablePincode.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!pincode) return res.status(404).json({ message: 'Pincode not found' });
    res.json(pincode);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deletePincode = async (req, res) => {
  try {
    const pincode = await ServiceablePincode.findById(req.params.id);
    if (!pincode) return res.status(404).json({ message: 'Pincode not found' });
    
    // Soft delete / disable
    pincode.isServiceable = false;
    await pincode.save();
    res.json({ message: 'Pincode disabled successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.bulkUploadPincodes = async (req, res) => {
  try {
    const { pincodes } = req.body;
    if (!Array.isArray(pincodes)) {
      return res.status(400).json({ message: 'Expected an array of pincodes' });
    }

    let successCount = 0;
    let failCount = 0;
    const errors = [];

    for (const item of pincodes) {
      try {
        await ServiceablePincode.findOneAndUpdate(
          { pincode: item.pincode },
          item,
          { upsert: true, new: true, runValidators: true }
        );
        successCount++;
      } catch (err) {
        failCount++;
        errors.push({ pincode: item.pincode, error: err.message });
      }
    }

    res.json({ successCount, failCount, errors });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// --- Shipping Rate Management ---
exports.getShippingRates = async (req, res) => {
  try {
    const rates = await ShippingRateConfig.find().sort({ zone: 1 });
    res.json(rates);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateShippingRate = async (req, res) => {
  try {
    const rate = await ShippingRateConfig.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!rate) return res.status(404).json({ message: 'Rate config not found' });
    res.json(rate);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
