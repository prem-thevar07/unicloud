import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser, registerUser } from "../services/authService";
import "../styles/auth.css";

/* ===============================
   PASSWORD CHECK FUNCTION
=============================== */
const validatePassword = (password) => ({
  length: password.length >= 8,
  upper: /[A-Z]/.test(password),
  lower: /[a-z]/.test(password),
  number: /[0-9]/.test(password),
  special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
});

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  const [passwordChecks, setPasswordChecks] = useState({
    length: false,
    upper: false,
    lower: false,
    number: false,
    special: false
  });

  const isPasswordValid = Object.values(passwordChecks).every(Boolean);

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  /* ===============================
     HANDLE INPUT CHANGE
  =============================== */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    if (name === "password" && !isLogin) {
      setPasswordChecks(validatePassword(value));
    }
  };

  /* ===============================
     HANDLE SUBMIT
  =============================== */
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prevent double submission
    if (loading) return;

    /* ---------- LOGIN ---------- */
    if (isLogin) {
      try {
        setLoading(true);

        const res = await loginUser({
          email: form.email,
          password: form.password
        });

        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));

        navigate("/dashboard");
        window.location.reload();
      } catch (err) {
        const message = err.response?.data?.message;

        if (message === "Please verify your email first") {
          navigate("/verify-otp", {
            state: { email: form.email }
          });
        } else {
          alert(message || "Login failed");
        }
      } finally {
        setLoading(false);
      }

      return;
    }

    /* ---------- SIGN UP ---------- */
    if (form.password !== form.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    if (!isPasswordValid) {
      alert("Password does not meet security requirements");
      return;
    }

    try {
      setLoading(true);

      await registerUser({
        name: form.name,
        email: form.email,
        password: form.password
      });

      // Navigate ONLY after successful backend response
      navigate("/verify-otp", {
        state: { email: form.email }
      });
    } catch (err) {
      alert(
        err.response?.data?.message ||
        "Unable to send OTP. Please try again."
      );
    } finally {
      // 🔥 THIS GUARANTEES NO INFINITE LOADER
      setLoading(false);
    }
  };

  /* ===============================
     GOOGLE LOGIN
  =============================== */
  const googleLogin = () => {
    const backendBaseUrl = import.meta.env.VITE_API_BASE_URL.replace("/api", "");
    window.location.href = `${backendBaseUrl}/api/auth/google`;
  };

  return (
    <>
      <header className="navbar">
        <div className="logo">Unicloud</div>
      </header>

      {/* 🔄 GLOBAL LOADING OVERLAY */}
      {loading && (
        <div className="loading-overlay">
          <div className="spinner"></div>
          <p>{isLogin ? "Signing in..." : "Sending OTP to your email..."}</p>
        </div>
      )}

      <main className="auth-container">
        <h1>{isLogin ? "Welcome back" : "Create account"}</h1>

        <p className="subtitle">
          {isLogin
            ? "Sign in to access your unified dashboard."
            : "Create an account to get started with your unified cloud experience."}
        </p>

        <div className="tabs">
          <button
            className={`tab ${isLogin ? "active" : ""}`}
            onClick={() => setIsLogin(true)}
            disabled={loading}
          >
            Login
          </button>
          <button
            className={`tab ${!isLogin ? "active" : ""}`}
            onClick={() => setIsLogin(false)}
            disabled={loading}
          >
            Sign up
          </button>
        </div>

        <form className="card" onSubmit={handleSubmit}>
          {!isLogin && (
            <input
              type="text"
              name="name"
              placeholder="Full name"
              value={form.name}
              onChange={handleChange}
              required
            />
          )}

          <input
            type="email"
            name="email"
            placeholder="Email address"
            value={form.email}
            onChange={handleChange}
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
          />

          {/* 🔐 PASSWORD CHECKLIST */}
          {!isLogin && (
            <div className="password-checklist">
              <div className="pass1">
                <div className={passwordChecks.length ? "check done" : "check"}>
                  <span>✓</span> At least 8 characters
                </div>
                <div className={passwordChecks.upper ? "check done" : "check"}>
                  <span>✓</span> One uppercase letter
                </div>
              </div>

              <div className="pass2">
                <div className={passwordChecks.number ? "check done" : "check"}>
                  <span>✓</span> One number
                </div>
                <div className={passwordChecks.special ? "check done" : "check"}>
                  <span>✓</span> One special character
                </div>
              </div>
            </div>
          )}

          {!isLogin && (
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm password"
              value={form.confirmPassword}
              onChange={handleChange}
              required
            />
          )}

          <button
            className="primary-btn"
            type="submit"
            disabled={loading || (!isLogin && !isPasswordValid)}
          >
            {loading
              ? isLogin
                ? "Signing in..."
                : "Creating account..."
              : isLogin
              ? "Login"
              : "Register"}
          </button>

          <button
            type="button"
            className="google-btn"
            onClick={googleLogin}
            disabled={loading}
          >
            Continue with Google
          </button>
        </form>
      </main>

      <footer>© 2025 Unicloud</footer>
    </>
  );
};

export default Auth;
