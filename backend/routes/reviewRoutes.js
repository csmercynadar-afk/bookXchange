const express = require("express");
const router = express.Router();
const { getReviews, createReview } = require("../controllers/reviewController");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Optional auth middleware so both logged in users and visitors can post reviews, but if token exists, we capture their user ID
const optionalAuth = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select("-password");
    } catch (error) {
      // Ignore token verification errors for optional auth
    }
  }
  next();
};

router.get("/", getReviews);
router.post("/", optionalAuth, createReview);

module.exports = router;
