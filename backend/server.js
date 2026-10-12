// override:true => values in backend/.env win over stray Windows envi.ronment variables
// (a leftover system PORT=20128 was what caused the EADDRINUSE crash)
require("dns").setDefaultResultOrder("ipv4first");
require("dotenv").config({ override: true });
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const bookRoutes = require("./routes/bookRoutes");
const wishlistRoutes = require("./routes/wishlistRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const chatRoutes = require("./routes/chatRoutes");

const app = express();
app.set("trust proxy", 1);

// Security middleware
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:5173",
  "http://127.0.0.1:5173",
].filter(Boolean);

app.use(
  cors({
    origin: (origin, cb) => {
      // allow tools like curl/Postman (no origin) and our known frontends
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      return cb(new Error(`CORS blocked origin: ${origin}`));
    },
    credentials: true, // needed so the refresh-token cookie is sent/received
  })
);
app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.json({ message: "BookXchange API is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/chat", chatRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong on the server" });
});

const PORT = process.env.PORT || 5000;

(async () => {
  await connectDB(); // exits with a helpful message if MongoDB is unreachable
  const server = app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
  server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.error(`\n❌ Port ${PORT} is already in use. Stop the other process or change PORT in backend/.env`);
      console.error(`   Windows: netstat -ano | findstr :${PORT}   then   taskkill /PID <pid> /F\n`);
      process.exit(1);
    }
    throw err;
  });
})();
