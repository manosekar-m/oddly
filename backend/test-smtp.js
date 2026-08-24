require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  port: 587,
  secure: false,
  connectionTimeout: 20000,
  greetingTimeout: 20000,
  socketTimeout: 20000
});

transporter.verify(function(error, success) {
  if (error) {
    console.error("Nodemailer Verification Failed:", error.message);
  } else {
    console.log("Nodemailer Verification Successful! The server is ready to take our messages.");
  }
});
