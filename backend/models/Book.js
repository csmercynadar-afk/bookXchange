const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Book title is required"],
      trim: true,
    },
    author: {
      type: String,
      required: [true, "Author name is required"],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: 0,
    },
    condition: {
      type: String,
      required: true,
      enum: ["New", "Like New", "Good", "Fair", "Worn"],
      default: "Good",
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    coverImageUrl: {
      type: String,
      required: [true, "Cover image URL is required"],
    },
    additionalImages: [
      {
        type: String,
      },
    ],
    status: {
      type: String,
      enum: ["available", "sold"],
      default: "available",
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Book", bookSchema);
