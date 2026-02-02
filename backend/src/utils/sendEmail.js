// TEMP OTP SENDER (NO SMTP, NO NODEMAILER)

// This function keeps the SAME signature
// so you do NOT need to change controllers
export const sendOTPEmail = async (toEmail, otp) => {
  try {
    console.log(`
========================================
📧 OTP DELIVERY (TEMP MODE)
----------------------------------------
To Email : ${toEmail}
OTP      : ${otp}
Valid for: 10 minutes
========================================
    `);

    // Simulate async success (like an API/email)
    return Promise.resolve(true);

  } catch (error) {
    console.error("OTP console log failed:", error);
    throw error;
  }
};
