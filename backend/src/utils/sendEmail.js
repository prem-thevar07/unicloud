import axios from "axios";

export const sendOTPEmail = async (email, otp) => {
  try {
    const response = await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: {
          name: "Unicloud",
          email: "no-reply@unicloud.app"
        },
        to: [
          {
            email
          }
        ],
        subject: "Verify your email - Unicloud OTP",
        htmlContent: `
          <div style="font-family:Arial">
            <h2>Unicloud Email Verification</h2>
            <p>Your OTP is:</p>
            <h1>${otp}</h1>
            <p>This OTP is valid for <b>10 minutes</b>.</p>
            <p>If you didn’t request this, ignore this email.</p>
          </div>
        `
      },
      {
        headers: {
          "api-key": process.env.BREVO_API_KEY,
          "Content-Type": "application/json"
        },
        timeout: 10000 // 10 seconds
      }
    );

    console.log("Brevo API email sent:", response.data);
  } catch (error) {
    console.error(
      "Brevo API email error:",
      error.response?.data || error.message
    );
    throw error;
  }
};
