const Product = require('../models/Product');
const fs = require('fs');
const path = require('path');

exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find({ isActive: true }).sort({ createdAt: -1 });
    res.json(products);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getAllProductsAdmin = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.addProduct = async (req, res) => {
  try {
    const { name, description, price, discountedPrice, sizes, isNewArrival, category, images: bodyImages } = req.body;
    let images = req.files ? req.files.map(f => f.path) : [];
    if (bodyImages && Array.isArray(bodyImages)) {
      images = [...images, ...bodyImages];
    }
    const parsedSizes = typeof sizes === 'string' ? JSON.parse(sizes) : sizes;
    const product = await Product.create({
      name, description,
      price: Number(price),
      discountedPrice: Number(discountedPrice),
      images, sizes: parsedSizes, category,
      isNewArrival: isNewArrival === 'true' || isNewArrival === true,
    });
    res.status(201).json(product);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const { name, description, price, discountedPrice, sizes, isNewArrival, isActive, category } = req.body;
    if (name) product.name = name;
    if (description !== undefined) product.description = description;
    if (price) product.price = Number(price);
    if (discountedPrice) product.discountedPrice = Number(discountedPrice);
    if (category) product.category = category;
    if (isNewArrival !== undefined) product.isNewArrival = isNewArrival === 'true' || isNewArrival === true;
    if (isActive !== undefined) product.isActive = isActive === 'true' || isActive === true;
    if (sizes) {
      const parsedSizes = typeof sizes === 'string' ? JSON.parse(sizes) : sizes;
      product.sizes = parsedSizes;
    }
    // If new images uploaded, add them
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(f => f.path);
      product.images = [...product.images, ...newImages].slice(0, 5);
    }

    await product.save();
    res.json(product);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    // Images are now hosted on Cloudinary, so no local file deletion is required.
    // (Optional: add logic to delete from Cloudinary using cloudinary.uploader.destroy)
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product deleted successfully' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
