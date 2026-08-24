const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  connectionTimeout: 20000,
  greetingTimeout: 20000,
  socketTimeout: 20000,
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

module.exports = { sendOTPEmail };
