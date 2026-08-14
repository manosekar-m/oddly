const Razorpay = require('razorpay');
const crypto = require('crypto');

// Setup Razorpay Instance
// Use environment variables or placeholders if not set
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder_key_id',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'rzp_test_placeholder_key_secret',
});

// Create a Razorpay Order
exports.createOrder = async (req, res) => {
  try {
    const { amount } = req.body; // amount should be in rupees

    if (!amount) {
      return res.status(400).json({ message: 'Amount is required' });
    }

    const options = {
      amount: Math.round(amount * 100), // convert to paise
      currency: 'INR',
      receipt: `receipt_order_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    res.status(200).json({
      success: true,
      order,
      key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder_key_id'
    });
  } catch (error) {
    console.error('Razorpay Create Order Error:', error);
    res.status(500).json({ message: 'Failed to create Razorpay order', error: error.message });
  }
};

// Verify Razorpay Payment Signature
exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const secret = process.env.RAZORPAY_KEY_SECRET || 'rzp_test_placeholder_key_secret';

    const body = razorpay_order_id + '|' + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body.toString())
      .digest('hex');

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      // Payment is verified
      res.status(200).json({ success: true, message: 'Payment verified successfully' });
    } else {
      res.status(400).json({ success: false, message: 'Invalid payment signature' });
    }
  } catch (error) {
    console.error('Razorpay Verify Error:', error);
    res.status(500).json({ message: 'Internal Server Error during verification' });
  }
};
