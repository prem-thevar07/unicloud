import { Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import AuthSuccess from "./pages/AuthSuccess";
import OtpVerify from "./pages/OtpVerify";
import Profile from "./pages/Profile";
import OAuthSuccess from "./pages/OAuthSuccess";
import About from "./pages/About";




function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/verify-otp" element={<OtpVerify />} />
      <Route path="/auth/success" element={<AuthSuccess />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/oauth-success" element={<OAuthSuccess />} />
      <Route path="/about" element={<About />} />





      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
