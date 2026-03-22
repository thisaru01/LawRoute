import transporter from "../../config/mailer.js";

// Generic email sender.
// Single responsibility: send an email using the configured transporter.
// All callers depend on this function, not on Nodemailer directly (Dependency Inversion).
export async function sendEmail({ to, subject, html }) {
  const mailOptions = {
    from: process.env.MAIL_FROM,
    to,
    subject,
    html,
  };

  await transporter.sendMail(mailOptions);
}
