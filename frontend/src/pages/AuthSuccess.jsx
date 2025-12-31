import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const OAuthSuccess = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  useEffect(() => {
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

      // 🔥 THIS WAS MISSING
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      navigate("/dashboard");
    } catch (err) {
      console.error("OAuth decode failed", err);
      navigate("/auth");
    }
  }, [navigate, params]);

  return <p>Signing you in...</p>;
};

export default OAuthSuccess;
