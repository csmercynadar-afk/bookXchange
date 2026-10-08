// Shared signup / reset validation. Returns { errors, values } — errors is {} when everything is valid.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const NAME_RE = /^[\p{L}][\p{L}\p{M}\s.'-]{1,59}$/u;

// Indian mobile: 10 digits starting 6-9. Accepts +91 / 91 / 0 prefix, spaces and dashes.
const normalizePhone = (raw = "") => {
  let digits = String(raw).replace(/[\s\-()]/g, "");
  digits = digits.replace(/^\+?91/, "").replace(/^0/, "");
  return digits;
};
const PHONE_RE = /^[6-9]\d{9}$/;

const passwordError = (password = "") => {
  if (password.length < 8) return "Password must be at least 8 characters long";
  if (password.length > 72) return "Password must be at most 72 characters long";
  if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
    return "Password must contain at least one letter and one number";
  }
  return null;
};

const validateSignup = ({ name, email, phone, password } = {}) => {
  const errors = {};
  const values = {
    name: String(name || "").trim().replace(/\s+/g, " "),
    email: String(email || "").trim().toLowerCase(),
    phone: normalizePhone(phone),
    password: String(password || ""),
  };

  if (!values.name) errors.name = "Full name is required";
  else if (!NAME_RE.test(values.name)) errors.name = "Enter a valid name (letters only, at least 2 characters)";

  if (!values.email) errors.email = "Email is required";
  else if (!EMAIL_RE.test(values.email)) errors.email = "Enter a valid email address";

  if (!values.phone) errors.phone = "Phone number is required";
  else if (!PHONE_RE.test(values.phone)) errors.phone = "Enter a valid 10-digit mobile number";

  if (!values.password) errors.password = "Password is required";
  else {
    const pe = passwordError(values.password);
    if (pe) errors.password = pe;
  }

  return { errors, values };
};

module.exports = { validateSignup, passwordError, normalizePhone };
