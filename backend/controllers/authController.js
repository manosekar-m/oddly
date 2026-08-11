const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { sendOTPEmail } = require('../utils/sendOTP');

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();
const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

exports.register = async (req, res) => {
  try {
    let { name, email, mobile, password } = req.body;
    
    // Clean up empty strings to avoid unique constraint errors
    if (email) email = email.toLowerCase().trim(); else email = undefined;
    if (mobile) mobile = mobile.trim(); else mobile = undefined;

    if (!name || !password || (!email && !mobile))
      return res.status(400).json({ message: 'Name, password, and email or mobile are required' });

    // Build query safely
    const orConditions = [];
    if (email) orConditions.push({ email });
    if (mobile) orConditions.push({ mobile });

    const existing = await User.findOne({ $or: orConditions });
    if (existing) return res.status(400).json({ message: 'User already exists with this email or mobile' });

    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    
    const user = await User.create({ name, email, mobile, password, otp, otpExpiry });
    
    if (email) { 
      try { await sendOTPEmail(email, otp); } 
      catch (e) { console.log('Email error:', e.message); } 
    }
    
    res.status(201).json({ message: 'OTP sent. Please verify.', userId: user._id, otp });
  } catch (err) { 
    res.status(500).json({ message: err.message }); 
  }
};

exports.verifyOTP = async (req, res) => {
  try {
    const { userId, otp } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.otp !== otp) return res.status(400).json({ message: 'Invalid OTP' });
    if (user.otpExpiry < new Date()) return res.status(400).json({ message: 'OTP expired' });
    user.isVerified = true; user.otp = undefined; user.otpExpiry = undefined;
    await user.save();
    res.json({ message: 'Verified successfully', token: generateToken(user._id), user: { _id: user._id, name: user.name, email: user.email, mobile: user.mobile, role: user.role } });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.login = async (req, res) => {
  try {
    let { identifier, password } = req.body;
    if (identifier) identifier = identifier.toLowerCase();
    const user = await User.findOne({ $or: [{ email: identifier }, { mobile: identifier }] });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });
    if (!user.isVerified) return res.status(400).json({ message: 'Please verify OTP first' });
    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });
    res.json({ token: generateToken(user._id), user: { _id: user._id, name: user.name, email: user.email, mobile: user.mobile, role: user.role } });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.adminLogin = async (req, res) => {
  try {
    let { email, password } = req.body;
    if (email) email = email.toLowerCase().trim();
    if (password) password = password.trim();
    if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
      let admin = await User.findOne({ email, role: 'admin' });
      if (!admin) admin = await User.create({ name: 'Admin', email, password, role: 'admin', isVerified: true });
      return res.json({ token: generateToken(admin._id), user: { _id: admin._id, name: admin.name, email: admin.email, role: 'admin' } });
    }
    res.status(400).json({ message: 'Invalid admin credentials' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getProfile = async (req, res) => res.json(req.user);

exports.updateProfile = async (req, res) => {
  try {
    const { name, address, mobile } = req.body;
    const user = await User.findById(req.user._id);
    if (name) user.name = name;
    if (mobile) user.mobile = mobile;
    if (address) user.address = address;
    await user.save();
    res.json({ message: 'Profile updated', user });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);
    const isMatch = await user.matchPassword(oldPassword);
    if (!isMatch) return res.status(400).json({ message: 'Incorrect old password' });
    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password changed successfully' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.resendOTP = async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    const otp = generateOTP();
    user.otp = otp; user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();
    if (user.email) { try { await sendOTPEmail(user.email, otp); } catch (e) { console.log('Email error:', e.message); } }
    res.json({ message: 'OTP resent', otp });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
