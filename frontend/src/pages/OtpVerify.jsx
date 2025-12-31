import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { verifyOtp, resendOtp } from "../services/authService";
import "../styles/otp.css";

const OtpVerify = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const email = state?.email;

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(60);

  // 🔁 Countdown timer
  useEffect(() => {
    if (timer === 0) return;

    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  const handleVerify = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      await verifyOtp({ email, otp });
      alert("Email verified successfully");
      navigate("/auth");
    } catch (err) {
      alert(err.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      await resendOtp({ email });
      alert("New OTP sent to your email");
      setTimer(60); // restart timer
    } catch (err) {
      alert(err.response?.data?.message || "Failed to resend OTP");
    }
  };

  if (!email) {
    navigate("/auth");
    return null;
  }

  return (
    <>
      <header className="navbar">
        <div className="logo">Unicloud</div>
      </header>

      <main className="otp-container">
        <h1>Verify your email</h1>
        <p className="subtitle">
          Enter the 6-digit code sent to <span>{email}</span>
        </p>

        <form className="otp-card" onSubmit={handleVerify}>
          <input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            maxLength={6}
            required
          />

          <button className="primary-btn" disabled={loading}>
            {loading ? "Verifying..." : "Verify OTP"}
          </button>

          <div className="resend">
            {timer > 0 ? (
              <span>Resend OTP in {timer}s</span>
            ) : (
              <button
                type="button"
                className="resend-btn"
                onClick={handleResend}
              >
                Resend OTP
              </button>
            )}
          </div>
        </form>
      </main>

      <footer>© 2025 Unicloud</footer>
    </>
  );
};

export default OtpVerify;
