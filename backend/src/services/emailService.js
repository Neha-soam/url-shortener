const nodemailer = require('nodemailer');
const env = require('../config/env');

// Generic SMTP transport -- this works for BOTH providers without separate
// integrations:
//   Gmail:     SMTP_HOST=smtp.gmail.com SMTP_PORT=465 SMTP_USER=you@gmail.com
//              SMTP_PASS=<16-char App Password, NOT your normal password>
//              (Gmail requires 2FA enabled + an "App Password" generated at
//              https://myaccount.google.com/apppasswords -- a regular
//              account password will be rejected by Google.)
//   SendGrid:  SMTP_HOST=smtp.sendgrid.net SMTP_PORT=587
//              SMTP_USER=apikey   (literally the string "apikey")
//              SMTP_PASS=<your SendGrid API key>
let transporter = null;

function getTransporter() {
  if (transporter) return transporter;
  if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASS) {
    throw new Error(
      'Email is not configured: set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM in backend/.env'
    );
  }
  transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465, // 465 = implicit TLS; 587 = STARTTLS (secure:false, upgraded automatically)
    auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
  });
  return transporter;
}

async function sendOtpEmail(toEmail, code) {
  await getTransporter().sendMail({
    from: env.SMTP_FROM || env.SMTP_USER,
    to: toEmail,
    subject: 'Your verification code',
    text: `Your verification code is ${code}. It expires in ${env.OTP_EXPIRY_MINUTES} minutes. If you didn't request this, you can ignore this email.`,
    html: `<p>Your verification code is:</p><p style="font-size:28px;font-weight:700;letter-spacing:4px">${code}</p><p>It expires in ${env.OTP_EXPIRY_MINUTES} minutes. If you didn't request this, you can ignore this email.</p>`,
  });
}

module.exports = { sendOtpEmail };
