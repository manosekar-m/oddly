const express = require('express');
const router = express.Router();
const multer = require('multer');
const { placeOrder, getMyOrders, getAllOrders, getOrderById, updateOrderStatus, updatePaymentStatus } = require('../controllers/orderController');
const { protect, adminOnly } = require('../middleware/auth');

const { uploadCloud } = require('../config/cloudinary');
const { createOrder, verifyPayment } = require('../controllers/paymentController');

router.post('/razorpay/order', protect, createOrder);
router.post('/razorpay/verify', protect, verifyPayment);

router.post('/', protect, uploadCloud.single('paymentScreenshot'), placeOrder);
router.get('/my', protect, getMyOrders);
router.get('/admin/all', protect, adminOnly, getAllOrders);
router.get('/', protect, adminOnly, getAllOrders);
router.get('/:id', protect, getOrderById);
router.put('/:id/status', protect, adminOnly, updateOrderStatus);
router.put('/:id/payment', protect, adminOnly, updatePaymentStatus);

module.exports = router;
