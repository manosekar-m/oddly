const mongoose = require('mongoose');
const dotenv = require('dotenv');
const ServiceablePincode = require('../models/ServiceablePincode');
const ShippingRateConfig = require('../models/ShippingRateConfig');

dotenv.config({ path: require('path').resolve(__dirname, '../.env') });

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('MongoDB Connected')).catch(err => console.log(err));

const seedDeliveryData = async () => {
  try {
    // 1. Seed Shipping Rates
    await ShippingRateConfig.deleteMany();
    const rates = [
      { zone: 'local', baseRate: 50, extraRatePer500g: 30, codCharge: 40, codAvailableDefault: true, freeShippingThreshold: 1500 },
      { zone: 'regional', baseRate: 70, extraRatePer500g: 40, codCharge: 50, codAvailableDefault: true, freeShippingThreshold: 1500 },
      { zone: 'metro', baseRate: 80, extraRatePer500g: 50, codCharge: 50, codAvailableDefault: true, freeShippingThreshold: 2000 },
      { zone: 'national', baseRate: 100, extraRatePer500g: 60, codCharge: 50, codAvailableDefault: true, freeShippingThreshold: 2500 },
      { zone: 'remote', baseRate: 150, extraRatePer500g: 100, codCharge: 80, codAvailableDefault: false, freeShippingThreshold: 999999 }
    ];
    await ShippingRateConfig.insertMany(rates);
    console.log('Shipping rates seeded successfully.');

    // 2. Seed Pincodes (Sample 20 pincodes)
    await ServiceablePincode.deleteMany();
    const pincodes = [
      // Chennai (Local for warehouse usually)
      { pincode: '600001', city: 'Chennai', state: 'Tamil Nadu', zone: 'local', isServiceable: true, codAvailable: true, estimatedDays: 1 },
      { pincode: '600017', city: 'Chennai', state: 'Tamil Nadu', zone: 'local', isServiceable: true, codAvailable: true, estimatedDays: 1 },
      { pincode: '600028', city: 'Chennai', state: 'Tamil Nadu', zone: 'local', isServiceable: true, codAvailable: true, estimatedDays: 1 },
      { pincode: '600040', city: 'Chennai', state: 'Tamil Nadu', zone: 'local', isServiceable: true, codAvailable: true, estimatedDays: 1 },
      
      // Regional (Tamil Nadu, Karnataka, AP, Kerala)
      { pincode: '641001', city: 'Coimbatore', state: 'Tamil Nadu', zone: 'regional', isServiceable: true, codAvailable: true, estimatedDays: 2 },
      { pincode: '560001', city: 'Bengaluru', state: 'Karnataka', zone: 'regional', isServiceable: true, codAvailable: true, estimatedDays: 2 },
      { pincode: '560034', city: 'Bengaluru', state: 'Karnataka', zone: 'regional', isServiceable: true, codAvailable: true, estimatedDays: 2 },
      { pincode: '500001', city: 'Hyderabad', state: 'Telangana', zone: 'regional', isServiceable: true, codAvailable: true, estimatedDays: 3 },
      { pincode: '682001', city: 'Kochi', state: 'Kerala', zone: 'regional', isServiceable: true, codAvailable: true, estimatedDays: 3 },

      // Metro
      { pincode: '400001', city: 'Mumbai', state: 'Maharashtra', zone: 'metro', isServiceable: true, codAvailable: true, estimatedDays: 4 },
      { pincode: '400050', city: 'Mumbai', state: 'Maharashtra', zone: 'metro', isServiceable: true, codAvailable: true, estimatedDays: 4 },
      { pincode: '110001', city: 'New Delhi', state: 'Delhi', zone: 'metro', isServiceable: true, codAvailable: true, estimatedDays: 4 },
      { pincode: '110020', city: 'New Delhi', state: 'Delhi', zone: 'metro', isServiceable: true, codAvailable: true, estimatedDays: 4 },
      { pincode: '700001', city: 'Kolkata', state: 'West Bengal', zone: 'metro', isServiceable: true, codAvailable: true, estimatedDays: 5 },

      // National
      { pincode: '380001', city: 'Ahmedabad', state: 'Gujarat', zone: 'national', isServiceable: true, codAvailable: true, estimatedDays: 5 },
      { pincode: '302001', city: 'Jaipur', state: 'Rajasthan', zone: 'national', isServiceable: true, codAvailable: true, estimatedDays: 6 },
      { pincode: '462001', city: 'Bhopal', state: 'Madhya Pradesh', zone: 'national', isServiceable: true, codAvailable: true, estimatedDays: 5 },
      { pincode: '226001', city: 'Lucknow', state: 'Uttar Pradesh', zone: 'national', isServiceable: true, codAvailable: true, estimatedDays: 6 },

      // Remote
      { pincode: '781001', city: 'Guwahati', state: 'Assam', zone: 'remote', isServiceable: true, codAvailable: false, estimatedDays: 8 },
      { pincode: '190001', city: 'Srinagar', state: 'Jammu & Kashmir', zone: 'remote', isServiceable: true, codAvailable: false, estimatedDays: 9 },
    ];
    await ServiceablePincode.insertMany(pincodes);
    console.log('Sample Pincodes seeded successfully.');

    process.exit();
  } catch (err) {
    console.error('Error seeding data:', err);
    process.exit(1);
  }
};

seedDeliveryData();
