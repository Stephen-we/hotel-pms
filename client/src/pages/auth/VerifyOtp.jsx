import React, { useState } from "react";
import { authAPI } from "../../services/api";
import { useNavigate, useLocation } from "react-router-dom";

export default function VerifyOtp() {
  const navigate = useNavigate();
  const location = useLocation();
  const { tempToken, deviceId, userEmail } = location.state || {};

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!tempToken || !deviceId) {
    return <div className="p-10 text-center text-red-600">Invalid request</div>;
  }

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await authAPI.verifyOtp({
        tempToken,
        otp,
        deviceId,
      });

      if (res.data.success) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));

        navigate("/dashboard");
      }
    } catch (err) {
      console.log(err);
      setError("Invalid or expired OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100 p-5">
      <div className="bg-white shadow-lg p-8 rounded-lg w-full max-w-md">
        <h2 className="text-2xl font-semibold mb-4 text-center">Verify Device</h2>

        <p className="text-center mb-2">
          OTP has been sent to:
          <span className="font-bold"> {userEmail}</span>
        </p>

        <input
          type="text"
          maxLength={6}
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          className="border p-3 rounded w-full text-center text-xl tracking-widest"
          placeholder="Enter OTP"
        />

        {error && <p className="text-red-500 text-center mt-2">{error}</p>}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-blue-600 text-white p-3 rounded mt-4 disabled:bg-gray-400"
        >
          {loading ? "Verifying..." : "Verify OTP"}
        </button>
      </div>
    </div>
  );
}
