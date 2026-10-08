const User = require("../models/User");
const Book = require("../models/Book");
const sendEmail = require("../utils/sendEmail");

// @route  GET /api/wishlist
const getWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: "wishlist",
      populate: { path: "seller", select: "name email phone" },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user.wishlist || []);
  } catch (error) {
    console.error("Get wishlist error:", error.message);
    res.status(500).json({ message: "Server error fetching wishlist" });
  }
};

// @route  POST /api/wishlist/toggle/:bookId
const toggleWishlist = async (req, res) => {
  try {
    const { bookId } = req.params;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const index = user.wishlist.findIndex((id) => id.toString() === bookId);
    let inWishlist = false;

    if (index > -1) {
      // Remove from wishlist
      user.wishlist.splice(index, 1);
      inWishlist = false;
    } else {
      // Add to wishlist
      user.wishlist.push(bookId);
      inWishlist = true;
    }

    await user.save();

    res.json({
      success: true,
      inWishlist,
      wishlistCount: user.wishlist.length,
      wishlist: user.wishlist,
    });
  } catch (error) {
    console.error("Toggle wishlist error:", error.message);
    res.status(500).json({ message: "Server error updating wishlist" });
  }
};

// @route  GET /api/wishlist/alerts
const getAlerts = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user.alerts || []);
  } catch (error) {
    console.error("Get alerts error:", error.message);
    res.status(500).json({ message: "Server error fetching alerts" });
  }
};

// @route  POST /api/wishlist/alerts
const addAlert = async (req, res) => {
  try {
    const { keyword } = req.body;
    if (!keyword || !keyword.trim()) {
      return res.status(400).json({ message: "Please enter a book title or keyword" });
    }

    const cleanKeyword = keyword.trim();
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const alreadyExists = user.alerts.some(
      (a) => a.keyword.toLowerCase() === cleanKeyword.toLowerCase()
    );

    if (alreadyExists) {
      return res.status(400).json({ message: "Alert for this keyword already exists" });
    }

    user.alerts.push({ keyword: cleanKeyword });
    await user.save();

    res.status(201).json({
      success: true,
      message: `Alert set for "${cleanKeyword}"! You'll be notified when it's posted.`,
      alerts: user.alerts,
    });
  } catch (error) {
    console.error("Add alert error:", error.message);
    res.status(500).json({ message: "Server error setting alert" });
  }
};

// @route  DELETE /api/wishlist/alerts/:alertId
const removeAlert = async (req, res) => {
  try {
    const { alertId } = req.params;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.alerts = user.alerts.filter((a) => a._id.toString() !== alertId);
    await user.save();

    res.json({
      success: true,
      message: "Alert removed",
      alerts: user.alerts,
    });
  } catch (error) {
    console.error("Remove alert error:", error.message);
    res.status(500).json({ message: "Server error removing alert" });
  }
};

// Helper: Notify users when a newly listed book matches their alerts
const notifyMatchingAlertUsers = async (book) => {
  try {
    const usersWithAlerts = await User.find({
      "alerts.0": { $exists: true },
      _id: { $ne: book.seller },
    });

    const bookSearchText = `${book.title} ${book.author} ${book.description}`.toLowerCase();

    for (const user of usersWithAlerts) {
      const matchedAlerts = user.alerts.filter((alert) =>
        bookSearchText.includes(alert.keyword.toLowerCase())
      );

      if (matchedAlerts.length > 0) {
        const matchedKeywords = matchedAlerts.map((a) => `"${a.keyword}"`).join(", ");
        const html = `
          <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; border: 1px solid #c8e6c9; border-radius: 16px; background: #f4faf6;">
            <h2 style="color: #2ecc71; text-align: center; margin-top: 0;">Book Alert Matched! 🔔📚</h2>
            <p>Hello <strong>${user.name}</strong>,</p>
            <p>Great news! A book matching your alert keyword(s) <strong>${matchedKeywords}</strong> has just been listed on BookXchange:</p>
            <div style="background: #ffffff; border: 1px solid #e0e0e0; border-radius: 12px; padding: 16px; margin: 16px 0; display: flex; gap: 16px;">
              <img src="${book.coverImageUrl}" alt="${book.title}" style="width: 80px; height: 110px; object-fit: cover; border-radius: 8px;" />
              <div>
                <h3 style="margin: 0 0 6px 0; color: #333;">${book.title}</h3>
                <p style="margin: 0 0 4px 0; color: #666; font-size: 14px;">by ${book.author}</p>
                <p style="margin: 0 0 4px 0; color: #e91e8c; font-weight: bold; font-size: 18px;">₹${book.price}</p>
                <p style="margin: 0; color: #2ecc71; font-size: 13px;">Condition: ${book.condition}</p>
              </div>
            </div>
            <p style="font-size: 14px; color: #555;">Log in to BookXchange to view the listing and contact the student seller!</p>
            <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;" />
            <p style="font-size: 12px; color: #999; text-align: center;">BookXchange - Student Book Marketplace</p>
          </div>
        `;

        await sendEmail({
          to: user.email,
          subject: `🔔 Book Alert: "${book.title}" is now available on BookXchange!`,
          text: `A book matching your alert (${matchedKeywords}) has just been listed: ${book.title} for ₹${book.price}. Check BookXchange to contact the seller!`,
          html,
        });
      }
    }
  } catch (error) {
    console.error("Alert notification error:", error.message);
  }
};

module.exports = {
  getWishlist,
  toggleWishlist,
  getAlerts,
  addAlert,
  removeAlert,
  notifyMatchingAlertUsers,
};
