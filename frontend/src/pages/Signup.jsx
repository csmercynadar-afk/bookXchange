import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import GoogleButton, { CLERK_ENABLED } from "../components/GoogleButton";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const NAME_RE = /^[\p{L}][\p{L}\p{M}\s.'-]{1,59}$/u;
const PHONE_RE = /^[6-9]\d{9}$/;

const normalizePhone = (raw) =>
  String(raw || "").replace(/[\s\-()]/g, "").replace(/^\+?91/, "").replace(/^0/, "");

const validate = (v) => {
  const e = {};
  const name = v.name.trim().replace(/\s+/g, " ");
  if (!name) e.name = "Full name is required";
  else if (!NAME_RE.test(name)) e.name = "Enter a valid name (letters only, at least 2 characters)";

  if (!v.email.trim()) e.email = "Email is required";
  else if (!EMAIL_RE.test(v.email.trim())) e.email = "Enter a valid email address";

  if (!v.phone.trim()) e.phone = "Phone number is required";
  else if (!PHONE_RE.test(normalizePhone(v.phone))) e.phone = "Enter a valid 10-digit mobile number";

  if (!v.password) e.password = "Password is required";
  else if (v.password.length < 8) e.password = "Password must be at least 8 characters long";
  else if (!/[A-Za-z]/.test(v.password) || !/\d/.test(v.password)) {
    e.password = "Password must contain at least one letter and one number";
  }

  if (!v.confirmPassword) e.confirmPassword = "Please re-enter your password";
  else if (v.confirmPassword !== v.password) e.confirmPassword = "Passwords do not match";
  return e;
};

const EMPTY = { name: "", email: "", phone: "", password: "", confirmPassword: "" };

const Signup = () => {
  const [formData, setFormData] = useState(EMPTY);
  const [fieldErrors, setFieldErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  // Inputs stay read-only until the user clicks them. Browsers don't autofill read-only fields,
  // which stops Chrome from dropping a previously saved email/password into a *signup* form.
  const [unlocked, setUnlocked] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const next = { ...formData, [e.target.name]: e.target.value };
    setFormData(next);
    if (touched[e.target.name] || Object.keys(fieldErrors).length) {
      setFieldErrors(validate(next));
    }
  };

  const handleBlur = (e) => {
    setTouched((t) => ({ ...t, [e.target.name]: true }));
    setFieldErrors(validate(formData));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const errs = validate(formData);
    setFieldErrors(errs);
    setTouched({ name: true, email: true, phone: true, password: true, confirmPassword: true });
    if (Object.keys(errs).length) {
      setError("Please fix the highlighted fields before signing up.");
      return;
    }

    setLoading(true);
    try {
      const { confirmPassword, ...payload } = formData;
      payload.phone = normalizePhone(payload.phone);
      payload.name = payload.name.trim().replace(/\s+/g, " ");
      payload.email = payload.email.trim().toLowerCase();
      const { data } = await api.post("/auth/signup", payload);
      login(data);
      navigate("/");
    } catch (err) {
      const serverErrors = err.response?.data?.errors;
      if (serverErrors) setFieldErrors((prev) => ({ ...prev, ...serverErrors }));
      setError(err.response?.data?.message || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const shown = (field) => (touched[field] || fieldErrors[field]) && fieldErrors[field];
  const inputProps = (field) => ({
    name: field,
    value: formData[field],
    onChange: handleChange,
    onBlur: handleBlur,
    readOnly: !unlocked,
    onFocus: () => setUnlocked(true),
    "aria-invalid": !!shown(field),
    className: shown(field) ? "input-invalid" : undefined,
  });
  const FieldError = ({ field }) =>
    shown(field) ? <div className="field-error">{fieldErrors[field]}</div> : null;

  return (
    <div className="form-page">
      <div className="form-card">
        <div className="form-logo">
          <img src="/logo/logo_full.png" alt="BookXchange" />
        </div>
        <h2 style={{ textAlign: "center" }}>Create Your Account 🌸</h2>
        <p className="form-subtitle" style={{ textAlign: "center" }}>Join BookXchange to start buying and selling books</p>
        {error && <div className="form-error">{error}</div>}
        <form onSubmit={handleSubmit} noValidate autoComplete="off">
          <label htmlFor="su-name">Full Name</label>
          <input
            id="su-name"
            type="text"
            placeholder="Your full name"
            autoComplete="off"
            maxLength={60}
            {...inputProps("name")}
          />
          <FieldError field="name" />

          <label htmlFor="su-email">Email</label>
          <input
            id="su-email"
            type="email"
            placeholder="you@example.com"
            autoComplete="off"
            {...inputProps("email")}
          />
          <FieldError field="email" />

          <label htmlFor="su-phone">Phone Number</label>
          <input
            id="su-phone"
            type="tel"
            inputMode="numeric"
            placeholder="10-digit mobile number"
            autoComplete="off"
            maxLength={16}
            {...inputProps("phone")}
          />
          <FieldError field="phone" />

          <label htmlFor="su-password">Password</label>
          <div className="password-wrap">
            <input
              id="su-password"
              type={showPassword ? "text" : "password"}
              placeholder="At least 8 characters, with a letter and a number"
              autoComplete="new-password"
              {...inputProps("password")}
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword((s) => !s)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
          <FieldError field="password" />

          <label htmlFor="su-confirm">Confirm Password</label>
          <input
            id="su-confirm"
            type={showPassword ? "text" : "password"}
            placeholder="Re-enter your password"
            autoComplete="new-password"
            {...inputProps("confirmPassword")}
          />
          <FieldError field="confirmPassword" />

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Creating account..." : "Sign Up Free"}
          </button>
        </form>
        {CLERK_ENABLED && <GoogleButton label="Sign up with Google" />}
        <p className="form-footer-text">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
