import { Link, useNavigate } from "react-router-dom";
import { useWishlist } from "../context/WishlistContext";
import { useAuth } from "../context/AuthContext";
import BookCover from "./BookCover";

const BookCard = ({ book }) => {
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { user } = useAuth();
  const navigate = useNavigate();
  const wishlisted = isWishlisted(book._id);

  // Don't let sellers wishlist their own listing
  const isOwnBook = user && book.seller && (
    user._id === book.seller._id || user._id === book.seller
  );

  const handleHeartClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      navigate("/login");
      return;
    }
    toggleWishlist(book._id);
  };

  return (
    <Link to={`/books/${book._id}`} className="book-card">
      <div className="book-card-image-wrap" style={{ position: "relative" }}>
        <BookCover
          src={book.coverImageUrl}
          alt={book.title}
          title={book.title}
          className="book-card-image"
        />
        {book.status === "sold" && <span className="sold-badge">SOLD</span>}

        {isOwnBook ? (
          <span style={{
            position: "absolute", top: 8, right: 8,
            background: "#2ecc71", color: "#fff", fontSize: 10,
            padding: "3px 7px", borderRadius: 10, fontWeight: 700,
            zIndex: 2,
          }}>Your Listing</span>
        ) : (
          <button
            type="button"
            onClick={handleHeartClick}
            title={wishlisted ? "Remove from wishlist" : "Save to wishlist"}
            className={`wishlist-heart-btn ${wishlisted ? "active" : ""}`}
            style={{
              position: "absolute", top: 8, right: 8,
              background: wishlisted ? "#fff" : "rgba(255,255,255,0.85)",
              border: "none", borderRadius: "50%", width: 34, height: 34,
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 2px 8px rgba(0,0,0,0.18)",
              cursor: "pointer", fontSize: 16, transition: "all 0.2s ease",
              zIndex: 2,
            }}
          >
            {wishlisted ? "❤️" : "🤍"}
          </button>
        )}
      </div>
      <div className="book-card-info">
        <h3>{book.title}</h3>
        <p className="book-card-author">by {book.author}</p>
        <div className="book-card-bottom">
          <span className="book-card-price">₹{book.price}</span>
          <span className={`condition-badge condition-${(book.condition || "good").replace(/\s/g, "")}`}>
            {book.condition}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default BookCard;
