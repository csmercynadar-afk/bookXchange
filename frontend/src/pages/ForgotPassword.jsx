import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";

const ForgotPassword = () => {
  const [step, setStep] = useState(1); // 1 = enter email, 2 = enter OTP + new password
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const navigate = useNavigate();

  // Step 1: Send OTP to email
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const { data } = await api.post("/auth/forgot-password", { email });
      setMessage(data.message || "Verification code sent! Please check your email inbox.");
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send reset code. Please check your email.");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Reset Password using OTP
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (newPassword.length < 8 || !/[A-Za-z]/.test(newPassword) || !/\d/.test(newPassword)) {
      setError("Password must be at least 8 characters and include a letter and a number.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const { data } = await api.post("/auth/reset-password", {
        email,
        otp: otp.trim(),
        newPassword,
      });

      setMessage(data.message || "Password updated successfully! Redirecting to login...");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Invalid or expired code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setError("");
    setMessage("");
    setLoading(true);
    try {
      const { data } = await api.post("/auth/forgot-password", { email });
      setMessage("A new 6-digit code has been sent to your email.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to resend code.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-page">
      <div className="form-card">
        <div className="form-logo">
          <img src="/logo/logo_full.png" alt="BookXchange" />
        </div>
        <h2 style={{ textAlign: "center" }}>
          {step === 1 ? "Reset Password 🔐" : "Verify Code & Set Password ✨"}
        </h2>
        <p className="form-subtitle" style={{ textAlign: "center" }}>
          {step === 1
            ? "Enter your registered email and we'll send you a 6-digit OTP"
            : `Enter the 6-digit code sent to ${email}`}
        </p>

        {error && <div className="form-error">{error}</div>}
        {message && <div className="form-success">{message}</div>}

        {step === 1 ? (
          <form onSubmit={handleRequestOtp}>
            <label>Registered Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. yourname@college.edu"
              required
              autoFocus
            />
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Sending OTP Code..." : "Send Verification Code ✉️"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword}>
            <label>6-Digit Verification Code (OTP)</label>
            <input
              type="text"
              maxLength="6"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="e.g. 849201"
              required
              style={{
                letterSpacing: "4px",
                fontSize: "18px",
                fontWeight: "700",
                textAlign: "center",
              }}
              autoFocus
            />

            <label style={{ marginTop: 12 }}>New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="At least 8 characters, with a letter and a number"
              autoComplete="new-password"
              required
            />

            <label style={{ marginTop: 12 }}>Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter new password"
              autoComplete="new-password"
              required
            />

            <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: 16 }}>
              {loading ? "Updating Password..." : "Reset & Save Password 🌸"}
            </button>

            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 16, fontSize: "13px" }}>
              <button
                type="button"
                onClick={() => setStep(1)}
                style={{ background: "none", border: "none", color: "#888", cursor: "pointer", padding: 0 }}
              >
                ← Change Email
              </button>
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={loading}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--color-primary-dark)",
                  cursor: "pointer",
                  fontWeight: "600",
                  padding: 0,
                }}
              >
                Resend Code
              </button>
            </div>
          </form>
        )}

        <p className="form-footer-text" style={{ marginTop: 24 }}>
          Remembered your password? <Link to="/login">Back to Login</Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
