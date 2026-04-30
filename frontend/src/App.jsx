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
import Files from "./pages/Files";
import ManageAccounts from "./pages/ManageAccounts";




import Photos from "./pages/Photos";
import Upload from "./pages/Upload";

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
      <Route path="/files" element={<Files />} />
      <Route path="/manage-accounts" element={<ManageAccounts />} />
      <Route path="/photos" element={<ProtectedRoute><Photos /></ProtectedRoute>} />
      <Route path="/upload" element={<ProtectedRoute><Upload /></ProtectedRoute>} />
      





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
