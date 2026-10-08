import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import BookCover from "../components/BookCover";
import { useAuth } from "../context/AuthContext";

const MyListings = () => {
  const { user } = useAuth();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchMyBooks = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/books/user/mine");
      setBooks(data);
    } catch (err) {
      setError("Could not load your listings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMyBooks(); }, []);

  const handleDelete = async (bookId) => {
    if (!window.confirm("Are you sure you want to delete this listing?")) return;
    try {
      await api.delete(`/books/${bookId}`);
      setBooks(books.filter((b) => b._id !== bookId));
    } catch (err) {
      alert(err.response?.data?.message || "Could not delete listing.");
    }
  };

  const handleToggleSold = async (book) => {
    try {
      const newStatus = book.status === "sold" ? "available" : "sold";
      const { data } = await api.put(`/books/${book._id}`, { status: newStatus });
      setBooks(books.map((b) => (b._id === book._id ? data : b)));
    } catch (err) {
      alert(err.response?.data?.message || "Could not update listing status.");
    }
  };

  return (
    <div className="page-container">
      <h2 className="page-title">My Profile & Listings</h2>

      <div className="profile-box">
        <p><strong>Name:</strong> {user?.name}</p>
        <p><strong>Email:</strong> {user?.email}</p>
        <p><strong>Phone:</strong> {user?.phone}</p>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 32 }}>
        <h3 className="page-subtitle" style={{ margin: 0 }}>Your Book Listings</h3>
        <Link to="/add-book" className="btn-primary btn-small">+ Add New Book</Link>
      </div>

      {loading && <p className="status-text">Loading your listings...</p>}
      {error && <p className="status-text form-error">{error}</p>}

      {!loading && books.length === 0 && (
        <div className="empty-state">
          <span className="empty-state-icon">📚</span>
          <h3>No listings yet</h3>
          <p>Start selling your books and earn some money!</p>
          <Link to="/add-book" className="btn-primary">Sell Your First Book</Link>
        </div>
      )}

      <div className="my-listings-list">
        {books.map((book) => (
          <div key={book._id} className="my-listing-row">
            <BookCover src={book.coverImageUrl} alt={book.title} title={book.title} />
            <div className="my-listing-info">
              <h4>{book.title}</h4>
              <p>
                ₹{book.price} · {book.condition} ·{" "}
                <span className={book.status === "sold" ? "status-sold" : "status-available"}>
                  {book.status === "sold" ? "Sold" : "Available"}
                </span>
              </p>
            </div>
            <div className="my-listing-actions">
              <Link to={`/books/${book._id}`} className="btn-secondary btn-small">View</Link>
              <Link to={`/edit-book/${book._id}`} className="btn-secondary btn-small">Edit</Link>
              <button className="btn-secondary btn-small" onClick={() => handleToggleSold(book)}>
                Mark as {book.status === "sold" ? "Available" : "Sold"}
              </button>
              <button className="btn-danger btn-small" onClick={() => handleDelete(book._id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyListings;
