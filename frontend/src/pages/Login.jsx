import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import GoogleButton, { CLERK_ENABLED } from "../components/GoogleButton";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [searchParams] = useSearchParams();
  const [error, setError] = useState(searchParams.get("error") || "");
  const [loading, setLoading] = useState(false);
  // Inputs stay read-only until clicked: browsers never autofill read-only fields,
  // so Chrome can't drop a saved email/password into the form when the page opens.
  const [unlocked, setUnlocked] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  // Always start empty (also covers back/forward cache restoring old values)
  useEffect(() => {
    setFormData({ email: "", password: "" });
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", formData);
      login(data);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
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
        <h2 style={{ textAlign: "center" }}>Welcome Back 👋</h2>
        <p className="form-subtitle" style={{ textAlign: "center" }}>Log in to buy or sell books</p>
        {error && <div className="form-error">{error}</div>}
        <form onSubmit={handleSubmit} autoComplete="off">
          <label>Email</label>
          <input type="email" autoComplete="off" readOnly={!unlocked} onFocus={() => setUnlocked(true)} name="email" value={formData.email} onChange={handleChange} placeholder="you@example.com" required />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <label style={{ margin: 0 }}>Password</label>
            <Link to="/forgot-password" style={{ fontSize: "12px", color: "var(--color-primary-dark)", fontWeight: 600 }}>Forgot Password?</Link>
          </div>
          <input type="password" autoComplete="new-password" readOnly={!unlocked} onFocus={() => setUnlocked(true)} name="password" value={formData.password} onChange={handleChange} placeholder="Your password" required style={{ marginTop: 6 }} />
          <button type="submit" className="btn-primary" disabled={loading}>{loading ? "Logging in..." : "Login"}</button>
        </form>
        {CLERK_ENABLED && <GoogleButton label="Continue with Google" />}
        <p className="form-footer-text">Don't have an account? <Link to="/signup">Sign Up Free</Link></p>
      </div>
    </div>
  );
};

export default Login;
