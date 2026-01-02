import axios from "axios";

export const sendOTPEmail = async (email, otp) => {
  try {
    await axios.post(
      "https://api.mailjet.com/v3.1/send",
      {
        Messages: [
          {
            From: {
              Email: process.env.MAILJET_FROM_EMAIL,
              Name: process.env.MAILJET_FROM_NAME
            },
            To: [
              {
                Email: email
              }
            ],
            Subject: "Verify your email - Unicloud OTP",
            HTMLPart: `
              <div style="font-family: Arial, sans-serif">
                <h2>Unicloud Email Verification</h2>
                <p>Your OTP is:</p>
                <h1>${otp}</h1>
                <p>This OTP is valid for <b>10 minutes</b>.</p>
                <p>If you didn’t request this, ignore this email.</p>
              </div>
            `
          }
        ]
      },
      {
        auth: {
          username: process.env.MAILJET_API_KEY,
          password: process.env.MAILJET_API_SECRET
        },
        headers: {
          "Content-Type": "application/json"
        },
        timeout: 10000
      }
    );

    console.log("Mailjet OTP email sent to:", email);
  } catch (error) {
    console.error(
      "Mailjet email error:",
      error.response?.data || error.message
    );
    throw error; // IMPORTANT for controller handling
  }
};
