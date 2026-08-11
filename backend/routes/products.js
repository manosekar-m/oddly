const express = require('express');
const router = express.Router();
const multer = require('multer');
const { getProducts, getAllProductsAdmin, getProductById, addProduct, updateProduct, deleteProduct } = require('../controllers/productController');
const { protect, adminOnly } = require('../middleware/auth');

const { uploadCloud } = require('../config/cloudinary');

router.get('/', getProducts);
router.get('/admin/all', protect, adminOnly, getAllProductsAdmin);
router.get('/:id', getProductById);

// Separate upload route for convenience
router.post('/upload', protect, adminOnly, uploadCloud.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
  res.json({ url: req.file.path });
});

router.post('/', protect, adminOnly, uploadCloud.array('images', 5), addProduct);
router.put('/:id', protect, adminOnly, uploadCloud.array('images', 5), updateProduct);
router.delete('/:id', protect, adminOnly, deleteProduct);

module.exports = router;
