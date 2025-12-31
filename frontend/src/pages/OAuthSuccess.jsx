import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const OAuthSuccess = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (!token) {
      navigate("/auth");
      return;
    }

    try {
      const decoded = jwtDecode(token);

      const user = {
        id: decoded.id,
        name: decoded.name,
        email: decoded.email
      };

      // ✅ Store BOTH
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      navigate("/dashboard");
      window.location.reload(); // sync header
    } catch (err) {
      console.error("JWT decode failed", err);
      navigate("/auth");
    }
  }, [navigate]);

  return null;
};

export default OAuthSuccess;
