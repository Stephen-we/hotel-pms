// server/services/emailService.js
import nodemailer from "nodemailer";

// ❌ DO NOT load dotenv here
// ❌ DO NOT throw errors at import time

export const sendOTPEmail = async (to, otp, user, deviceInfo) => {
  // ✅ Validate env ONLY when function is called
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error("❌ EMAIL ENV MISSING AT SEND TIME", {
      USER: process.env.EMAIL_USER,
      PASS: process.env.EMAIL_PASS ? "PASS_OK" : "NO_PASS",
    });
    throw new Error("Email service not configured");
  }

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"Hotel PMS Security" <${process.env.EMAIL_USER}>`,
    to,
    subject: "🔐 Login OTP - Hotel PMS",
    html: `
      <h2>Login Verification</h2>
      <p>Hello <b>${user.username}</b>,</p>
      <p>Your OTP is:</p>
      <h1>${otp}</h1>
      <p>This OTP is valid for 10 minutes.</p>
      <hr/>
      <p><b>Device:</b> ${deviceInfo.os} / ${deviceInfo.browser}</p>
      <p><b>IP:</b> ${deviceInfo.ipAddress}</p>
    `,
  };

  await transporter.sendMail(mailOptions);

  console.log(`📨 OTP email sent to ${to}`);
};
