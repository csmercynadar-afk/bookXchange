// Populates the database with demo books and community reviews
// so the site looks rich and lively.
//
// Run with: node seed.js

require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const User = require("./models/User");
const Book = require("./models/Book");
const Review = require("./models/Review");

const sampleBooks = [
  {
    title: "Introduction to Algorithms",
    author: "Thomas H. Cormen",
    price: 650,
    condition: "Good",
    description: "Classic CLRS textbook, minor highlighting in a few chapters, spine intact.",
    coverImageUrl: "https://covers.openlibrary.org/b/isbn/9780262033848-L.jpg",
    additionalImages: [
      "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1532012164546-f432f2e3edd4?w=600&auto=format&fit=crop&q=80",
    ],
  },
  {
    title: "Clean Code",
    author: "Robert C. Martin",
    price: 450,
    condition: "Like New",
    description: "Barely used, bought for a course but switched branches. Zero pencil or pen marks.",
    coverImageUrl: "https://covers.openlibrary.org/b/isbn/9780132350884-L.jpg",
    additionalImages: [
      "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&auto=format&fit=crop&q=80",
    ],
  },
  {
    title: "The Alchemist",
    author: "Paulo Coelho",
    price: 180,
    condition: "Good",
    description: "A personal favorite, gently read, no markings. Great bedtime reading.",
    coverImageUrl: "https://covers.openlibrary.org/b/isbn/9780062315007-L.jpg",
    additionalImages: [],
  },
  {
    title: "Atomic Habits",
    author: "James Clear",
    price: 320,
    condition: "Like New",
    description: "Read once, kept in great condition with the dust jacket. Must-have for students.",
    coverImageUrl: "https://covers.openlibrary.org/b/isbn/9780735211292-L.jpg",
    additionalImages: [
      "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&auto=format&fit=crop&q=80",
    ],
  },
  {
    title: "Sapiens: A Brief History of Humankind",
    author: "Yuval Noah Harari",
    price: 380,
    condition: "Good",
    description: "Some underlining in the first few chapters, rest is clean.",
    coverImageUrl: "https://covers.openlibrary.org/b/isbn/9780062316097-L.jpg",
    additionalImages: [],
  },
  {
    title: "Harry Potter and the Sorcerer's Stone",
    author: "J.K. Rowling",
    price: 250,
    condition: "Fair",
    description: "Well-loved copy, cover slightly worn but all pages intact.",
    coverImageUrl: "https://covers.openlibrary.org/b/isbn/9780590353427-L.jpg",
    additionalImages: [],
  },
  {
    title: "The Pragmatic Programmer",
    author: "David Thomas, Andrew Hunt",
    price: 500,
    condition: "Like New",
    description: "20th anniversary edition, read once, kept carefully.",
    coverImageUrl: "https://covers.openlibrary.org/b/isbn/9780135957059-L.jpg",
    additionalImages: [
      "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&auto=format&fit=crop&q=80",
    ],
  },
];

const sampleReviews = [
  {
    name: "Aarav Mehta",
    role: "B.Tech Computer Science, 3rd Year",
    rating: 5,
    title: "Saved over ₹1,800 on semester textbooks! 🚀",
    comment:
      "BookXchange made it so easy to get my Core CS textbooks directly from campus seniors. Meeting at the college library was super safe and quick. Highly recommend!",
    tags: ["Saved Money", "Campus Verified", "Fast Handover"],
    verifiedDeal: true,
  },
  {
    name: "Sneha Roy",
    role: "Literature Major, 2nd Year",
    rating: 5,
    title: "Sold 4 fiction novels in 2 days 🌸",
    comment:
      "Listing my books was effortless with the photo uploader. Buyers pinged me on WhatsApp and we completed the deal during lunch break. Great platform design!",
    tags: ["Easy Listing", "Friendly Buyers", "Fast Sale"],
    verifiedDeal: true,
  },
  {
    name: "Rohan Kulkarni",
    role: "Electronics Engineering, Final Year",
    rating: 5,
    title: "Wishlist alerts are a lifesaver! 🔔",
    comment:
      "I put an alert for 'Signal Processing' and got an email notification as soon as a junior posted it. Book condition was pristine and price was 60% off retail.",
    tags: ["Instant Alert", "Great Condition", "Huge Discount"],
    verifiedDeal: true,
  },
  {
    name: "Ananya Deshmukh",
    role: "MBA 1st Year",
    rating: 4,
    title: "Super clean UI and genuine sellers",
    comment:
      "The aesthetic pink theme is beautiful and the book multi-angle previews helped me inspect the spine and notes before messaging the seller.",
    tags: ["Detailed Photos", "Safe Community", "Affordable"],
    verifiedDeal: true,
  },
];

const DEMO_SELLER = {
  name: "Campus Book Seller",
  email: "demo.seller@bookxchange.example.com",
  password: "demo12345",
  phone: "9876543210",
};

const seed = async () => {
  try {
    await connectDB();

    let seller = await User.findOne({ email: DEMO_SELLER.email });
    if (!seller) {
      seller = await User.create(DEMO_SELLER);
      console.log(`Created demo seller: ${seller.email}`);
    } else {
      console.log(`Using existing demo seller: ${seller.email}`);
    }

    let createdBooks = 0;
    for (const bookData of sampleBooks) {
      const exists = await Book.findOne({ title: bookData.title, seller: seller._id });
      if (!exists) {
        await Book.create({ ...bookData, seller: seller._id });
        createdBooks++;
      }
    }
    console.log(`Seeded ${createdBooks} new book(s).`);

    let createdReviews = 0;
    for (const rev of sampleReviews) {
      const exists = await Review.findOne({ title: rev.title });
      if (!exists) {
        await Review.create(rev);
        createdReviews++;
      }
    }
    console.log(`Seeded ${createdReviews} verified community review(s).`);

    process.exit(0);
  } catch (error) {
    console.error("Seeding error:", error.message);
    process.exit(1);
  }
};

seed();
