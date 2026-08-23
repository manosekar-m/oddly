const express = require('express');
const router = express.Router();
const { getAllUsers, deleteUser, getStats } = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/auth');

const { getPincodes, addPincode, updatePincode, deletePincode, bulkUploadPincodes, getShippingRates, updateShippingRate } = require('../controllers/deliveryAdminController');

router.get('/stats', protect, adminOnly, getStats);
router.get('/users', protect, adminOnly, getAllUsers);
router.delete('/users/:id', protect, adminOnly, deleteUser);

// Delivery Management
router.get('/delivery/pincodes', protect, adminOnly, getPincodes);
router.post('/delivery/pincodes', protect, adminOnly, addPincode);
router.put('/delivery/pincodes/:id', protect, adminOnly, updatePincode);
router.delete('/delivery/pincodes/:id', protect, adminOnly, deletePincode);
router.post('/delivery/pincodes/bulk', protect, adminOnly, bulkUploadPincodes);

// Shipping Rates Config
router.get('/delivery/rates', protect, adminOnly, getShippingRates);
router.put('/delivery/rates/:id', protect, adminOnly, updateShippingRate);

module.exports = router;
