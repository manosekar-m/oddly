const nodemailer = require('nodemailer');
const axios = require('axios');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

const sendOTPEmail = async (email, otp) => {
  await transporter.sendMail({
    from: `"ODDLY" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Your ODDLY OTP Verification Code',
    html: `<div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;padding:32px;background:#f9f9f9;border-radius:12px;">
      <h2 style="color:#1a1a1a;">Your OTP Code</h2>
      <p style="color:#555;">Use this code to verify your ODDLY account:</p>
      <div style="font-size:36px;font-weight:bold;letter-spacing:8px;color:#111;margin:24px 0;">${otp}</div>
      <p style="color:#999;font-size:13px;">This OTP expires in 10 minutes.</p>
    </div>`,
  });
};

const sendSMSOTP = async (mobile, otp) => {
  const message = `Welcome to oddly and your otp is ${otp} thankyou`;
  
  if (!process.env.FAST2SMS_API_KEY) {
    console.log(`\n[SMS SIMULATION] To: ${mobile} | Message: ${message}\n`);
    return;
  }

  try {
    const response = await axios.get('https://www.fast2sms.com/dev/bulkV2', {
      params: {
        authorization: process.env.FAST2SMS_API_KEY,
        route: 'v3',
        sender_id: 'TXTIND',
        message: message,
        language: 'english',
        flash: 0,
        numbers: mobile
      }
    });
    console.log(`SMS Sent Successfully to ${mobile}:`, response.data);
  } catch (error) {
    console.error('Failed to send SMS via Fast2SMS:', error.response ? error.response.data : error.message);
  }
};

module.exports = { sendOTPEmail, sendSMSOTP };
