const express = require('express');
const router = express.Router();
const { calculateShippingRate } = require('../utils/delivery');

// @route   POST /api/delivery/check
// @desc    Check delivery availability and get shipping rate estimate
// @access  Public
router.post('/check', async (req, res) => {
  try {
    const { pincode, cartValue, totalItems = 1, paymentMethod = 'Prepaid' } = req.body;

    if (!pincode || !/^[0-9]{6}$/.test(pincode)) {
      return res.status(400).json({ message: 'Please provide a valid 6-digit pincode' });
    }

    if (cartValue === undefined) {
      return res.status(400).json({ message: 'Cart value is required for calculation' });
    }

    // Weight Calculation based on user constraint:
    // "yes till 3 produts 500 gm if it above that it changes"
    // So up to 3 products -> 500g. Every extra product beyond 3 adds (for example) 200g.
    const baseWeight = 500;
    let totalWeightInGrams = baseWeight;
    if (totalItems > 3) {
      // arbitrary business logic for extra items
      totalWeightInGrams = baseWeight + ((totalItems - 3) * 200);
    }

    const deliveryEstimate = await calculateShippingRate(
      pincode, 
      totalWeightInGrams, 
      cartValue, 
      paymentMethod
    );

    res.json(deliveryEstimate);
  } catch (error) {
    console.error('Delivery Check Error:', error);
    res.status(500).json({ message: 'Failed to calculate delivery estimate' });
  }
});

module.exports = router;
