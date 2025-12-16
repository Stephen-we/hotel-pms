// client/src/pages/Login.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function Login() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const [step, setStep] = useState("login"); // "login" | "otp"
  const [otp, setOtp] = useState("");
  const [tempToken, setTempToken] = useState("");
  const [deviceName, setDeviceName] = useState("");
  const [userEmail, setUserEmail] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await api.post("/auth/login", formData);

      // 🔐 CASE 1: Requires OTP (new device)
      if (response.data.requiresOTP) {
        setStep("otp");
        setTempToken(response.data.tempToken);
        setDeviceName(response.data.deviceName);
        setUserEmail(response.data.userEmail);
        setOtp("");
        return;
      }

      // ✅ CASE 2: Normal login (trusted device)
      const { token, user } = response.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      window.location.href = "/";
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await api.post("/auth/verify-otp", {
        tempToken,
        otp,
      });

      const { token, user } = response.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      window.location.href = "/";
    } catch (err) {
      setError(err.response?.data?.message || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  const renderLoginForm = () => (
    <form onSubmit={handleLoginSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-500/20 border border-red-500/40 text-red-400 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm text-slate-400 mb-1">
          Username or Email
        </label>
        <input
          type="text"
          required
          value={formData.username}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, username: e.target.value }))
          }
          className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400 outline-none focus:border-primary transition"
          placeholder="Enter your username or email"
        />
      </div>

      <div>
        <label className="block text-sm text-slate-400 mb-1">Password</label>
        <input
          type="password"
          required
          value={formData.password}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, password: e.target.value }))
          }
          className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400 outline-none focus:border-primary transition"
          placeholder="Enter your password"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-primary hover:bg-primaryDark text-white py-3 rounded-xl font-medium transition disabled:opacity-50"
      >
        {loading ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );

  const renderOtpForm = () => (
    <form onSubmit={handleOtpSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-500/20 border border-red-500/40 text-red-400 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      <div className="text-sm text-slate-300 mb-2">
        We’ve detected a <span className="font-semibold">new device</span>.  
        An OTP has been sent to:
        <div className="mt-1 text-primary text-xs break-all">{userEmail}</div>
        <div className="mt-1 text-slate-400 text-xs">
          Device: <span className="font-medium text-slate-200">{deviceName}</span>
        </div>
      </div>

      <div>
        <label className="block text-sm text-slate-400 mb-1">
          Enter 6-digit OTP
        </label>
        <input
          type="text"
          required
          maxLength={6}
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
          className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400 outline-none focus:border-primary transition tracking-widest text-center"
          placeholder="••••••"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-primary hover:bg-primaryDark text-white py-3 rounded-xl font-medium transition disabled:opacity-50"
      >
        {loading ? "Verifying OTP..." : "Verify & Continue"}
      </button>

      <button
        type="button"
        onClick={() => {
          // allow going back to login step if needed
          setStep("login");
          setOtp("");
          setTempToken("");
          setError("");
        }}
        className="w-full mt-2 text-slate-400 hover:text-slate-200 text-xs"
      >
        ← Back to login
      </button>
    </form>
  );

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">Hotel PMS</h1>
          <p className="text-slate-400">
            {step === "login"
              ? "Sign in to your account"
              : "Verify this new device with OTP"}
          </p>
        </div>

        {step === "login" ? renderLoginForm() : renderOtpForm()}

        {/* Demo Credentials (only for login step) */}
        {step === "login" && (
          <div className="mt-6 p-4 bg-slate-700/50 rounded-xl">
            <h3 className="text-sm font-medium text-slate-300 mb-2">
              Demo Credentials:
            </h3>
            <div className="text-xs text-slate-400 space-y-1">
              <div>
                <strong>Admin:</strong> admin / admin123
              </div>
              <div>
                <strong>Manager:</strong> manager / manager123
              </div>
              <div>
                <strong>Reception:</strong> reception / reception123
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
