import nodemailer from "nodemailer";

let transporter;

function getTransporter() {
  if (transporter) return transporter;

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error("EMAIL ENV NOT LOADED");
  }

  transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  return transporter;
}

export async function sendOTPEmail(to, otp, user, deviceInfo) {
  try {
    const transporter = getTransporter();

    await transporter.sendMail({
      from: `"Hotel PMS Security" <${process.env.EMAIL_USER}>`,
      to,
      subject: "Hotel PMS Login OTP",
      html: `
        <h2>Hotel PMS Login Verification</h2>
        <p><b>User:</b> ${user.username}</p>
        <p><b>Device:</b> ${deviceInfo.deviceName}</p>
        <p><b>IP:</b> ${deviceInfo.ipAddress}</p>
        <h1 style="font-size:32px;color:#2563eb">${otp}</h1>
        <p>Valid for 10 minutes</p>
      `,
    });

    console.log("📧 OTP EMAIL SENT TO:", to);

  } catch (err) {
    console.error("❌ EMAIL SEND FAILED:", err.message);
  }
}
