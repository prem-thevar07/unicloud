import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp-relay.brevo.com",
  port: Number(process.env.EMAIL_PORT) || 587,
  secure: false, // MUST be false for 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Verify SMTP connection (runs once on startup)
transporter.verify((error) => {
  if (error) {
    console.error("Brevo SMTP verification failed:", error);
  } else {
    console.log("Brevo SMTP is ready");
  }
});

export const sendOTPEmail = async (email, otp) => {
  try {
    console.log("Attempting to send OTP email to:", email);

    await transporter.sendMail({
      from: process.env.EMAIL_FROM || "Unicloud <no-reply@unicloud.app>",
      to: email,
      subject: "Verify your email - Unicloud OTP",
      html: `
        <div style="font-family:Arial">
          <h2>Unicloud Email Verification</h2>
          <p>Your OTP is:</p>
          <h1>${otp}</h1>
          <p>This OTP is valid for <b>10 minutes</b>.</p>
          <p>If you didn’t request this, ignore this email.</p>
        </div>
      `
    });

    console.log("OTP email sent successfully to:", email);

  } catch (error) {
    console.error("Brevo sendMail error:", error);
    throw error; // 🔥 THIS LINE IS MANDATORY
  }
};
