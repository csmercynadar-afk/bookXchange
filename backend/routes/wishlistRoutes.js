const express = require("express");
const router = express.Router();
const {
  getWishlist,
  toggleWishlist,
  getAlerts,
  addAlert,
  removeAlert,
} = require("../controllers/wishlistController");
const { protect } = require("../middleware/authMiddleware");

router.use(protect); // All wishlist and alert routes require login

router.get("/", getWishlist);
router.post("/toggle/:bookId", toggleWishlist);
router.get("/alerts", getAlerts);
router.post("/alerts", addAlert);
router.delete("/alerts/:alertId", removeAlert);

module.exports = router;
