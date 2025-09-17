import React, { useState } from "react";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export default function GovLoginPage() {
  const [email, setEmail] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // ==================== Request OTP ====================
  const handleRequestOtp = async () => {
    setMessage("");

    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail.endsWith("@gov.in")) {
      setMessage("Please use a valid government email ending with @gov.in");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post(`${BACKEND_URL}/api/government/request-otp`, { email: trimmedEmail });
      setLoading(false);

      if (res.data.success) {
        setOtpSent(true);

        let devMsg = res.data.message;
        if (process.env.NODE_ENV !== "production") {
          devMsg += " (Check server console for OTP in development)";
        }

        setMessage(`✅ ${devMsg}`);
      } else {
        setMessage(res.data.message || "Failed to send OTP.");
      }
    } catch (err) {
      setLoading(false);
      console.error(err);

      if (err.response) {
        setMessage(err.response.data.message || `Error ${err.response.status}`);
      } else if (err.request) {
        setMessage("No response from server. Please try again later.");
      } else {
        setMessage("An error occurred. Please try again.");
      }
    }
  };

  // ==================== Verify OTP ====================
  const handleVerifyOtp = async () => {
    setMessage("");
    const trimmedEmail = email.trim().toLowerCase();

    if (!otp) {
      setMessage("Please enter the OTP sent to your email.");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post(`${BACKEND_URL}/api/government/verify-otp`, { email: trimmedEmail, otp });
      setLoading(false);

      if (res.data.success) {
        localStorage.setItem("govtToken", res.data.token);
        window.location.href = "/gov-dashboard";
      } else {
        setMessage(res.data.message || "Failed to verify OTP.");
      }
    } catch (err) {
      setLoading(false);
      console.error(err);

      if (err.response) {
        setMessage(err.response.data.message || `Error ${err.response.status}`);
      } else if (err.request) {
        setMessage("No response from server. Please try again later.");
      } else {
        setMessage("An error occurred. Please try again.");
      }
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 shadow rounded mt-10">
      <h2 className="text-xl font-bold mb-4">Government Login</h2>

      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@gov.in"
        className="w-full p-2 mb-4 border rounded"
      />

      {!otpSent ? (
        <button
          onClick={handleRequestOtp}
          className={`bg-blue-500 text-white px-4 py-2 rounded ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
          disabled={loading}
        >
          {loading ? "Sending OTP..." : "Request OTP"}
        </button>
      ) : (
        <>
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="Enter OTP"
            className="w-full p-2 mb-4 border rounded"
          />
          <button
            onClick={handleVerifyOtp}
            className={`bg-green-500 text-white px-4 py-2 rounded ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
            disabled={loading}
          >
            {loading ? "Verifying..." : "Verify & Login"}
          </button>
        </>
      )}

      {message && (
        <p className={`mt-4 ${message.startsWith("✅") ? "text-green-500" : "text-red-500"}`}>
          {message}
        </p>
      )}
    </div>
  );
}
