const Review = require("../models/Review");

// @route  GET /api/reviews
const getReviews = async (req, res) => {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 });

    const totalReviews = reviews.length;
    const averageRating =
      totalReviews > 0
        ? (reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews).toFixed(1)
        : 5.0;

    const ratingCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((r) => {
      const star = Math.round(r.rating);
      if (ratingCounts[star] !== undefined) {
        ratingCounts[star]++;
      }
    });

    res.json({
      reviews,
      stats: {
        totalReviews,
        averageRating: Number(averageRating),
        ratingCounts,
      },
    });
  } catch (error) {
    console.error("Get reviews error:", error.message);
    res.status(500).json({ message: "Server error fetching reviews" });
  }
};

// @route  POST /api/reviews
const createReview = async (req, res) => {
  try {
    const { name, role, rating, title, comment, tags } = req.body;

    if (!name || !rating || !title || !comment) {
      return res.status(400).json({ message: "Please fill in all required review fields" });
    }

    const numericRating = Number(rating);
    if (isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5 stars" });
    }

    const review = await Review.create({
      user: req.user ? req.user._id : null,
      name: req.user ? req.user.name : name,
      role: role || "Verified Student",
      rating: numericRating,
      title,
      comment,
      tags: Array.isArray(tags) ? tags : [],
      verifiedDeal: true,
    });

    res.status(201).json({
      success: true,
      message: "Thank you! Your review has been posted 🌸",
      review,
    });
  } catch (error) {
    console.error("Create review error:", error.message);
    res.status(500).json({ message: "Server error posting review" });
  }
};

module.exports = {
  getReviews,
  createReview,
};
