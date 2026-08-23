const ServiceablePincode = require('../models/ServiceablePincode');
const ShippingRateConfig = require('../models/ShippingRateConfig');

/**
 * Calculates the shipping rate and delivery estimate.
 * @param {string} destinationPincode - The 6-digit destination pincode.
 * @param {number} weightInGrams - The total weight of the order in grams.
 * @param {number} orderValue - The total value of the cart before shipping.
 * @param {string} paymentMethod - 'COD' or 'Prepaid' (or other).
 * @returns {Object} Delivery info including costs and dates.
 */
const calculateShippingRate = async (destinationPincode, weightInGrams, orderValue, paymentMethod) => {
  // 1. Check if the destination pincode exists and is serviceable
  const pincodeRecord = await ServiceablePincode.findOne({ pincode: destinationPincode });
  
  if (!pincodeRecord || !pincodeRecord.isServiceable) {
    return {
      serviceable: false,
      message: 'Sorry, we do not currently deliver to this pincode.'
    };
  }

  // 2. Fetch the shipping rate config for this zone
  const rateConfig = await ShippingRateConfig.findOne({ zone: pincodeRecord.zone });
  
  if (!rateConfig) {
    // Fallback if config is missing for some reason
    return {
      serviceable: false,
      message: 'Service temporarily unavailable for this region.'
    };
  }

  // 3. Determine if COD is allowed
  const isCodRequested = paymentMethod === 'COD';
  if (isCodRequested && (!pincodeRecord.codAvailable || !rateConfig.codAvailableDefault)) {
    return {
      serviceable: false,
      message: 'COD is not available for this pincode. Please choose a prepaid method.'
    };
  }

  // 4. Calculate base shipping cost
  // Base rate covers up to 500g. Every extra 500g adds extraRatePer500g.
  const extraWeight = Math.max(0, weightInGrams - 500);
  const extraUnits = Math.ceil(extraWeight / 500);
  let shippingCost = rateConfig.baseRate + (extraUnits * rateConfig.extraRatePer500g);

  // 5. Apply COD charge if applicable
  let codCharge = 0;
  if (isCodRequested) {
    codCharge = rateConfig.codCharge;
    shippingCost += codCharge;
  }

  // 6. Apply free shipping logic
  let freeShippingApplied = false;
  // Remote zones do not get free shipping
  if (pincodeRecord.zone !== 'remote') {
    if (orderValue >= rateConfig.freeShippingThreshold) {
      // Free shipping applies to the base and weight costs. COD charge usually still applies, 
      // but if the business requirement is shippingCost = 0, we'll zero out the base shipping.
      // We will subtract the base+weight costs, but keep the COD fee if applicable.
      const costWithoutCod = shippingCost - codCharge;
      shippingCost -= costWithoutCod;
      freeShippingApplied = true;
    }
  }

  // 7. Calculate estimated delivery date
  const today = new Date();
  const estimatedDeliveryDate = new Date(today);
  estimatedDeliveryDate.setDate(today.getDate() + pincodeRecord.estimatedDays);

  return {
    serviceable: true,
    zone: pincodeRecord.zone,
    estimatedDeliveryDate,
    shippingCost,
    codCharge,
    freeShippingApplied,
    codAvailable: pincodeRecord.codAvailable && rateConfig.codAvailableDefault,
    message: `Delivery by ${estimatedDeliveryDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`
  };
};

module.exports = {
  calculateShippingRate
};
