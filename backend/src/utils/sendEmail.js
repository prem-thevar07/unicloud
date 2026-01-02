import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD
  }
});

// Optional: verify connection on startup
transporter.verify((err, success) => {
  if (err) {
    console.error("Gmail SMTP verification failed:", err);
  } else {
    console.log("Gmail SMTP is ready");
  }
});

export const sendOTPEmail = async (toEmail, otp) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: toEmail,
      subject: "Verify your email - Unicloud OTP",
      html: `
        <div style="font-family: Arial, sans-serif">
          <h2>Unicloud Email Verification</h2>
          <p>Your OTP is:</p>
          <h1>${otp}</h1>
          <p>This OTP is valid for <b>10 minutes</b>.</p>
          <p>If you didn’t request this, ignore this email.</p>
        </div>
      `
    });

    console.log("OTP email sent:", info.messageId);
  } catch (error) {
    console.error("Gmail SMTP send error:", error);
    throw error; // IMPORTANT: let controller handle failure
  }
};
