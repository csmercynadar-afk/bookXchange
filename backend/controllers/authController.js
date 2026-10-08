const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { verifyToken, createClerkClient } = require("@clerk/backend");
const User = require("../models/User");
const sendEmail = require("../utils/sendEmail");
const { validateSignup, passwordError } = require("../utils/validators");
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} = require("../utils/tokenUtils");

const clerk = process.env.CLERK_SECRET_KEY
  ? createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY })
  : null;

const refreshCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000,
});

const signup = async (req, res) => {
  try {
    const { errors, values } = validateSignup(req.body);
    if (Object.keys(errors).length) {
      return res.status(400).json({
        message: Object.values(errors)[0],
        errors,
      });
    }
    const { name, email, password, phone } = values;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: "An account with this email already exists",
        errors: { email: "An account with this email already exists" },
      });
    }

    const user = await User.create({ name, email, password, phone });

    const welcomeHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; background: #fff; border-radius: 20px; overflow: hidden; border: 1px solid #f0d6e8;">
        <div style="background: linear-gradient(135deg, #e91e8c, #f06292); padding: 36px 32px; text-align: center;">
          <div style="font-size: 40px; margin-bottom: 8px;">📚🌸</div>
          <h1 style="color: #fff; margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.5px;">Welcome to BookXchange!</h1>
          <p style="color: rgba(255,255,255,0.85); margin: 8px 0 0; font-size: 14px;">Your student book marketplace</p>
        </div>
        <div style="padding: 32px;">
          <p style="font-size: 16px; color: #333; margin-top: 0;">Hey <strong>${user.name}</strong> 👋</p>
          <p style="color: #555; line-height: 1.7;">Welcome to BookXchange! Start buying and selling second-hand textbooks at student-friendly prices 🎓</p>
          <div style="text-align: center; margin: 28px 0 16px;">
            <a href="${process.env.CLIENT_URL || "http://localhost:5173"}" style="display: inline-block; background: linear-gradient(135deg, #e91e8c, #f06292); color: #fff; text-decoration: none; padding: 14px 36px; border-radius: 50px; font-weight: 700; font-size: 15px; box-shadow: 0 4px 16px rgba(233,30,140,0.3);">Start Exploring Books 📚</a>
          </div>
        </div>
        <div style="background: #fdf6fa; padding: 20px 32px; text-align: center; border-top: 1px solid #f0d6e8;">
          <p style="margin: 0; font-size: 13px; color: #e91e8c; font-weight: 700;">With love, Mercy 🌸</p>
        </div>
      </div>
    `;

    sendEmail({
      to: user.email,
      subject: "Welcome to BookXchange 🌸",
      text: `Hey ${user.name}! Welcome to BookXchange — start browsing at ${process.env.CLIENT_URL || "http://localhost:5173"}`,
      html: welcomeHtml,
    }).catch((err) => console.error("Welcome email error:", err.message));

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res.cookie("refreshToken", refreshToken, refreshCookieOptions());

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      token: accessToken,
    });
  } catch (error) {
    console.error("Signup error:", error.message);
    res.status(500).json({ message: "Server error during signup" });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Please provide email and password" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res.cookie("refreshToken", refreshToken, refreshCookieOptions());

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      token: accessToken,
    });
  } catch (error) {
    console.error("Login error:", error.message);
    res.status(500).json({ message: "Server error during login" });
  }
};

const getMe = async (req, res) => {
  res.json(req.user);
};

// Refresh token endpoint — rotates tokens
const refresh = async (req, res) => {
  const oldRefreshToken = req.cookies?.refreshToken;

  if (!oldRefreshToken) {
    return res.status(401).json({ message: "No refresh token provided" });
  }

  try {
    const decoded = verifyRefreshToken(oldRefreshToken);

    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // Generate new pair
    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    res.cookie("refreshToken", newRefreshToken, refreshCookieOptions());

    res.json({ token: newAccessToken });
  } catch (error) {
    console.error("Refresh error:", error.message);
    return res.status(403).json({ message: "Invalid or expired refresh token" });
  }
};

// Logout — revoke refresh token
const logout = async (req, res) => {
  res.clearCookie("refreshToken", { ...refreshCookieOptions(), maxAge: undefined });
  res.json({ message: "Logged out successfully" });
};

// Exchange a Clerk session token (Google / any Clerk social or email login) for a BookXchange session.
// Frontend sends:  Authorization: Bearer <clerk session token>
const clerkExchange = async (req, res) => {
  try {
    if (!clerk) {
      return res.status(500).json({ message: "Clerk is not configured (CLERK_SECRET_KEY missing on server)" });
    }
    const header = req.headers.authorization || "";
    const clerkToken = header.startsWith("Bearer ") ? header.slice(7) : req.body?.token;
    if (!clerkToken) return res.status(401).json({ message: "Clerk token required" });

    let payload;
    try {
      payload = await verifyToken(clerkToken, { secretKey: process.env.CLERK_SECRET_KEY });
    } catch (err) {
      console.error("Clerk token verify failed:", err.message);
      return res.status(401).json({ message: "Invalid or expired Clerk session" });
    }

    const clerkUser = await clerk.users.getUser(payload.sub);
    const primary =
      clerkUser.emailAddresses.find((e) => e.id === clerkUser.primaryEmailAddressId) ||
      clerkUser.emailAddresses[0];
    if (!primary) return res.status(400).json({ message: "Your account has no email address" });

    const email = primary.emailAddress.toLowerCase();
    const name =
      [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") ||
      clerkUser.username ||
      email.split("@")[0];

    let user = await User.findOne({ $or: [{ clerkId: clerkUser.id }, { email }] });
    if (!user) {
      user = await User.create({
        name,
        email,
        clerkId: clerkUser.id,
        phone: "",
        password: crypto.randomBytes(24).toString("hex"), // unused; social login only
      });
    } else if (!user.clerkId) {
      user.clerkId = clerkUser.id; // link existing email/password account to Clerk
      await user.save({ validateBeforeSave: false });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    res.cookie("refreshToken", refreshToken, refreshCookieOptions());

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      token: accessToken,
    });
  } catch (error) {
    console.error("Clerk exchange error:", error.message);
    res.status(500).json({ message: "Social login failed. Please try again." });
  }
};

// Forgot password (unchanged)
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Please provide email' });
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(404).json({ message: 'No account found' });
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 10 * 60 * 1000);
    user.resetPasswordOtp = otp;
    user.resetPasswordExpires = expiry;
    await user.save({ validateBeforeSave: false });
    const result = await sendEmail({
      to: user.email,
      subject: "BookXchange — Reset Code",
      html: `<div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;padding:24px;border:1px solid #f0d6e8;border-radius:16px">
        <h2 style="color:#e91e8c;margin-top:0">BookXchange password reset</h2>
        <p>Your 6-digit reset code is:</p>
        <p style="font-size:32px;letter-spacing:6px;font-weight:800;margin:12px 0">${otp}</p>
        <p style="color:#666">It expires in 10 minutes. If you didn't request this, ignore this email.</p></div>`,
      text: `Your BookXchange reset code: ${otp} (expires in 10 minutes)`,
    });

    if (!result.success) {
      if (process.env.NODE_ENV !== "production") {
        console.warn(`⚠️  [DEV] Email failed, so here is the OTP for ${user.email}: ${otp}`);
      }
      return res.status(502).json({
        message: "We couldn't send the verification email right now. Please try again in a moment.",
      });
    }
    res.json({ success: true, message: 'Verification code sent! Check your inbox (and spam folder).' });
  } catch (error) {
    console.error('Forgot password error:', error.message);
    res.status(500).json({ message: 'Failed' });
  }
};

const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ message: 'Email and OTP are required' });
    const user = await User.findOne({ email: email.toLowerCase(), resetPasswordOtp: otp, resetPasswordExpires: { $gt: Date.now() } });
    if (!user) return res.status(400).json({ message: 'Invalid or expired verification code' });
    res.json({ success: true, message: 'Code verified successfully' });
  } catch (error) {
    console.error('Verify OTP error:', error.message);
    res.status(500).json({ message: 'Server error verifying code' });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) return res.status(400).json({ message: 'Please provide all required fields' });
    const pwError = passwordError(newPassword);
    if (pwError) return res.status(400).json({ message: pwError });
    const user = await User.findOne({ email: email.toLowerCase(), resetPasswordOtp: otp, resetPasswordExpires: { $gt: Date.now() } });
    if (!user) return res.status(400).json({ message: 'Invalid or expired verification code' });
    user.password = newPassword;
    user.resetPasswordOtp = null;
    user.resetPasswordExpires = null;
    await user.save();
    res.json({ success: true, message: 'Password reset successful! You can now log in.' });
  } catch (error) {
    console.error('Reset password error:', error.message);
    res.status(500).json({ message: 'Failed to reset password. Please try again.' });
  }
};

module.exports = {
  signup,
  login,
  getMe,
  refresh,
  logout,
  clerkExchange,
  forgotPassword,
  verifyOtp,
  resetPassword,
};

