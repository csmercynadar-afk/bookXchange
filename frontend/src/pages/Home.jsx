import { useEffect, useState } from "react";
import api from "../api/axios";
import BookCard from "../components/BookCard";
import BannerSlider from "../components/BannerSlider";
import WhyChooseUs from "../components/WhyChooseUs";
import { Link } from "react-router-dom";

const Home = () => {
  const [allBooks, setAllBooks] = useState([]);
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchBooks = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/books");
      setAllBooks(data);
      setBooks(data);
    } catch (err) {
      setError("Could not load book listings. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBooks(); }, []);

  // Live dynamic search — filters as you type, resets when input is cleared
  const handleSearchChange = (e) => {
    const term = e.target.value;
    setSearch(term);
    if (!term.trim()) {
      setBooks(allBooks);
    } else {
      const lower = term.toLowerCase();
      setBooks(
        allBooks.filter(
          (b) =>
            b.title.toLowerCase().includes(lower) ||
            b.author.toLowerCase().includes(lower)
        )
      );
    }
  };

  return (
    <>
      <BannerSlider />
      <div className="page-container">
        {/* Hero */}
        <div className="hero">
          <div className="section-label">📖 Student Marketplace</div>
          <h1>Find Your Next Read,<br /><span>Sell Your Last One</span></h1>
          <p>Buy and sell second-hand books directly with fellow readers — simple, affordable, and sustainable.</p>
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search by title or author..."
              value={search}
              onChange={handleSearchChange}
            />
          </div>
        </div>

        {/* Books Section */}
        <div className="books-section">
          <div className="section-label">📚 Latest Listings</div>
          <h2 className="section-heading">Browse Available Books</h2>
          <p className="section-sub">Fresh listings from students near you</p>

          {loading && <p className="status-text">Loading listings...</p>}
          {error && <p className="status-text form-error">{error}</p>}

          {!loading && !error && books.length === 0 && (
            <div className="empty-state">
              <span className="empty-state-icon">📭</span>
              <h3>No books listed yet</h3>
              <p>Be the first to sell a book and help a fellow student!</p>
              <Link to="/add-book" className="btn-primary">Sell a Book</Link>
            </div>
          )}

          <div className="book-grid">
            {books.map((book) => (
              <BookCard key={book._id} book={book} />
            ))}
          </div>
        </div>

        <WhyChooseUs />
      </div>
    </>
  );
};

export default Home;
