const express = require("express");
const router = express.Router();
const {
  getBooks,
  getBookById,
  getMyBooks,
  createBook,
  updateBook,
  deleteBook,
} = require("../controllers/bookController");
const { protect } = require("../middleware/authMiddleware");

// IMPORTANT: /user/mine must be defined BEFORE /:id so Express doesn't treat "mine" as an :id param
router.get("/user/mine", protect, getMyBooks);

router.get("/", getBooks);
router.get("/:id", getBookById);
router.post("/", protect, createBook);
router.put("/:id", protect, updateBook);
router.delete("/:id", protect, deleteBook);

module.exports = router;
