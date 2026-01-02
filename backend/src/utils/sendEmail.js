import axios from "axios";

export const sendOTPEmail = async (email, otp) => {
  try {
    const response = await axios.post(
      "https://api.resend.com/emails",
      {
        from: "Unicloud <onboarding@resend.dev>", // FREE verified sender
        to: [email],
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
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json"
        },
        timeout: 10000
      }
    );

    console.log("Resend email sent:", response.data);
  } catch (error) {
    console.error(
      "Resend email error:",
      error.response?.data || error.message
    );
    throw error;
  }
};
