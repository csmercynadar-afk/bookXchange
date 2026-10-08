const Book = require("../models/Book");
const { notifyMatchingAlertUsers } = require("./wishlistController");

// @route  GET /api/books
// Supports optional ?search=term query for title/author search
const getBooks = async (req, res) => {
  try {
    const { search } = req.query;
    let filter = {};

    if (search) {
      filter = {
        $or: [
          { title: { $regex: search, $options: "i" } },
          { author: { $regex: search, $options: "i" } },
        ],
      };
    }

    const books = await Book.find(filter)
      .populate("seller", "name email phone")
      .sort({ createdAt: -1 });

    res.json(books);
  } catch (error) {
    console.error("Get books error:", error.message);
    res.status(500).json({ message: "Server error fetching books" });
  }
};

// @route  GET /api/books/:id
const getBookById = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id).populate("seller", "name email phone");
    if (!book) {
      return res.status(404).json({ message: "Book listing not found" });
    }
    res.json(book);
  } catch (error) {
    console.error("Get book error:", error.message);
    res.status(500).json({ message: "Server error fetching book" });
  }
};

// @route  GET /api/books/user/mine
const getMyBooks = async (req, res) => {
  try {
    const books = await Book.find({ seller: req.user._id }).sort({ createdAt: -1 });
    res.json(books);
  } catch (error) {
    console.error("Get my books error:", error.message);
    res.status(500).json({ message: "Server error fetching your listings" });
  }
};

// @route  POST /api/books
const createBook = async (req, res) => {
  try {
    const { title, author, price, condition, description, coverImageUrl, additionalImages } = req.body;

    if (!title || !author || !price || !condition || !coverImageUrl) {
      return res.status(400).json({ message: "Please fill in all required fields" });
    }

    const book = await Book.create({
      title,
      author,
      price,
      condition,
      description,
      coverImageUrl,
      additionalImages: Array.isArray(additionalImages) ? additionalImages.filter(Boolean) : [],
      seller: req.user._id,
    });

    // Notify any users whose alert keywords match this book (non-blocking)
    notifyMatchingAlertUsers(book).catch((err) =>
      console.error("Failed to process book alerts:", err.message)
    );

    res.status(201).json(book);
  } catch (error) {
    console.error("Create book error:", error.message);
    res.status(500).json({ message: "Server error creating listing" });
  }
};

// @route  PUT /api/books/:id
const updateBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({ message: "Book listing not found" });
    }

    if (book.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to edit this listing" });
    }

    const { title, author, price, condition, description, coverImageUrl, additionalImages, status } = req.body;

    book.title = title ?? book.title;
    book.author = author ?? book.author;
    book.price = price ?? book.price;
    book.condition = condition ?? book.condition;
    book.description = description ?? book.description;
    book.coverImageUrl = coverImageUrl ?? book.coverImageUrl;
    if (additionalImages !== undefined) {
      book.additionalImages = Array.isArray(additionalImages) ? additionalImages.filter(Boolean) : [];
    }
    book.status = status ?? book.status;

    const updatedBook = await book.save();
    res.json(updatedBook);
  } catch (error) {
    console.error("Update book error:", error.message);
    res.status(500).json({ message: "Server error updating listing" });
  }
};

// @route  DELETE /api/books/:id
const deleteBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({ message: "Book listing not found" });
    }

    if (book.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this listing" });
    }

    await book.deleteOne();
    res.json({ message: "Listing deleted successfully" });
  } catch (error) {
    console.error("Delete book error:", error.message);
    res.status(500).json({ message: "Server error deleting listing" });
  }
};

module.exports = {
  getBooks,
  getBookById,
  getMyBooks,
  createBook,
  updateBook,
  deleteBook,
};
