import nodemailer from "nodemailer";

// 1. Create the transporter (Configured for Render + Gmail)
const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // Use SSL for port 465
  auth: {
    user: process.env.EMAIL_USER, // Your gmail: e.g., student@gmail.com
    pass: process.env.EMAIL_PASS, // The 16-character App Password
  },
});

export const sendOTPEmail = async (toEmail, otp) => {
  try {
    const mailOptions = {
      from: `"Unicloud" <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject: "Verify your email - Unicloud OTP",
      html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee;">
            <h2 style="color: #333;">Unicloud Email Verification</h2>
            <p>Your OTP is:</p>
            <h1 style="letter-spacing:5px; color: #4A90E2; font-size: 32px;">${otp}</h1>
            <p>This OTP is valid for <b>10 minutes</b>.</p>
            <p style="font-size: 12px; color: #777;">If you didn’t request this, ignore this email.</p>
          </div>
        `,
    };

    // 2. Send the email
    const info = await transporter.sendMail(mailOptions);
    
    console.log("OTP email sent via Nodemailer:", info.messageId);
    return info;

  } catch (error) {
    console.error("Nodemailer OTP email error:", error);
    throw error; 
  }
};