import nodemailer from "nodemailer";

// Gmail SMTP transporter
// Credentials are read from environment variables — never hardcoded.
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

export default transporter;
