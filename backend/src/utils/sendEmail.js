import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false, // MUST be false for 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Optional but HIGHLY recommended
transporter.verify((error, success) => {
  if (error) {
    console.error("Brevo SMTP Error:", error);
  } else {
    console.log("Brevo SMTP is ready");
  }
});

export const sendOTPEmail = async (email, otp) => {
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
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
};
