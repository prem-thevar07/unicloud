import nodemailer from "nodemailer";
import 'dotenv/config'; // Make sure to install dotenv: npm install dotenv

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // Must be false for 587
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASS,
  },
  tls: {
    rejectUnauthorized: false // This helps bypass cloud security layers
  }
});

async function runTest() {
  console.log("Checking connection...");
  try {
    // Verify connection configuration
    await transporter.verify();
    console.log("✅ Server is ready to take our messages");

    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER, // Send it to yourself to test
      subject: "Nodemailer Test",
      text: "If you see this, your Render setup will work!",
    });

    console.log("✅ Email sent successfully! Message ID:", info.messageId);
  } catch (error) {
    console.error("❌ Error occurred:");
    console.error(error.message);
    
    if (error.message.includes("Invalid login")) {
      console.log("\n💡 TIP: Your App Password might be wrong or 2FA isn't enabled.");
    }
  }
}

runTest();