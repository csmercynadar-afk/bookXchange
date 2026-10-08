import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useWishlist } from "../context/WishlistContext";
import ImageLightbox from "../components/ImageLightbox";
import BookCover from "../components/BookCover";

const BookDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const navigate = useNavigate();

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const { data } = await api.get(`/books/${id}`);
        setBook(data);
        setSelectedImageIndex(0);
      } catch (err) {
        setError(err.response?.data?.message || "Could not load this listing.");
      } finally {
        setLoading(false);
      }
    };
    fetchBook();
  }, [id]);

  if (loading) return <p className="status-text">Loading book details...</p>;
  if (error) return <p className="status-text form-error">{error}</p>;
  if (!book) return null;

  const isOwner = user && book.seller && user._id === book.seller._id;
  const wishlisted = isWishlisted(book._id);

  // Collect all images (Cover + Additional angles)
  const allImages = [book.coverImageUrl, ...(book.additionalImages || [])].filter(Boolean);
  const currentDisplayImage = allImages[selectedImageIndex] || book.coverImageUrl;

  const handleWishlistClick = () => {
    if (!user) {
      navigate("/login");
      return;
    }
    toggleWishlist(book._id);
  };

  return (
    <div className="page-container" style={{ maxWidth: 1000, margin: "0 auto", padding: "24px 16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <Link to="/" className="btn-secondary btn-small" style={{ textDecoration: "none" }}>
          ← Back to listings
        </Link>
        <button
          type="button"
          onClick={handleWishlistClick}
          className={`btn-secondary btn-small ${wishlisted ? "active" : ""}`}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            borderColor: wishlisted ? "#e91e8c" : "#ddd",
            color: wishlisted ? "#e91e8c" : "#555",
            fontWeight: 600,
          }}
        >
          <span>{wishlisted ? "❤️ In Wishlist" : "🤍 Add to Wishlist"}</span>
        </button>
      </div>

      <div className="detail-card" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
        {/* Left: Gallery & Zoom Preview */}
        <div>
          <div
            className="detail-image-wrap"
            style={{
              position: "relative",
              borderRadius: 16,
              overflow: "hidden",
              background: "#fafafa",
              border: "1px solid #f0e6eb",
              cursor: "zoom-in",
              boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
            }}
            onClick={() => setLightboxOpen(true)}
          >
            <BookCover
              src={currentDisplayImage}
              alt={book.title}
              title={book.title}
              style={{
                width: "100%",
                height: 400,
                objectFit: "contain",
                display: "block",
                padding: 12,
              }}
            />

            {book.status === "sold" && <span className="sold-badge">SOLD</span>}

            {/* Click to zoom badge */}
            <div
              style={{
                position: "absolute",
                bottom: 12,
                right: 12,
                background: "rgba(0,0,0,0.7)",
                color: "#fff",
                padding: "6px 12px",
                borderRadius: 20,
                fontSize: 12,
                display: "flex",
                alignItems: "center",
                gap: 6,
                backdropFilter: "blur(4px)",
              }}
            >
              <span>🔍 Click to Inspect Fullscreen</span>
            </div>
          </div>

          {/* Thumbnail Strip */}
          {allImages.length > 1 && (
            <div style={{ marginTop: 14 }}>
              <span style={{ fontSize: 12, color: "#777", fontWeight: 600, display: "block", marginBottom: 6 }}>
                All Angles ({allImages.length} photos):
              </span>
              <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 4 }}>
                {allImages.map((img, idx) => (
                  <div
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    style={{
                      border: idx === selectedImageIndex ? "2px solid #e91e8c" : "2px solid transparent",
                      borderRadius: 8,
                      overflow: "hidden",
                      cursor: "pointer",
                      padding: 2,
                      background: "#fff",
                      boxShadow: idx === selectedImageIndex ? "0 0 8px rgba(233,30,140,0.3)" : "none",
                      transition: "all 0.2s ease",
                      flexShrink: 0,
                    }}
                  >
                    <img
                      src={img}
                      alt={`Angle ${idx + 1}`}
                      style={{
                        width: 58,
                        height: 70,
                        objectFit: "cover",
                        borderRadius: 6,
                        display: "block",
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Book Details & Seller Info */}
        <div className="detail-info" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <span className={`condition-badge condition-${(book.condition || "good").replace(/\s/g, "")}`}>
                {book.condition} Condition
              </span>
              {allImages.length > 1 && (
                <span style={{ fontSize: 12, background: "#e8f5e9", color: "#2e7d32", padding: "4px 8px", borderRadius: 8, fontWeight: 600 }}>
                  📸 Multi-Angle Verified
                </span>
              )}
            </div>

            <h1 style={{ margin: "8px 0 4px 0", fontSize: "26px", color: "#2c3e50" }}>{book.title}</h1>
            <p className="detail-author" style={{ color: "#7f8c8d", fontSize: "16px", margin: "0 0 16px 0" }}>
              by <strong>{book.author}</strong>
            </p>
            <p className="detail-price" style={{ fontSize: "28px", color: "#e91e8c", fontWeight: "bold", margin: "0 0 20px 0" }}>
              ₹{book.price}
            </p>

            <h3 style={{ fontSize: "16px", color: "#333", marginBottom: 6 }}>Description & Condition Notes</h3>
            <p className="detail-description" style={{ color: "#555", lineHeight: 1.6, background: "#fafafa", padding: 14, borderRadius: 10, border: "1px solid #eee" }}>
              {book.description || "No specific condition notes provided. Check the inspection photos above!"}
            </p>

            <h3 style={{ fontSize: "16px", color: "#333", margin: "20px 0 8px 0" }}>Seller Information 🎓</h3>
            <div className="seller-box" style={{ background: "#fdf8fa", border: "1px solid #f8d7da", borderRadius: 12, padding: 14 }}>
              <p style={{ margin: "0 0 6px 0" }}><strong>Name:</strong> {book.seller?.name || "Campus Student"}</p>
              <p style={{ margin: "0 0 6px 0" }}><strong>Email:</strong> {book.seller?.email || "Protected"}</p>
              <p style={{ margin: 0 }}><strong>Phone:</strong> {book.seller?.phone || "Available on request"}</p>
            </div>
          </div>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 24 }}>
            {!isOwner && book.status !== "sold" && (
              <>
                <a
                  href={`mailto:${book.seller?.email}?subject=Interested in buying ${book.title} on BookXchange`}
                  className="btn-primary"
                  style={{ flex: 1, textAlign: "center", textDecoration: "none" }}
                >
                  📧 Email Seller
                </a>
                {book.seller?.phone && (
                  <a
                    href={`tel:${book.seller?.phone}`}
                    className="btn-mint"
                    style={{ flex: 1, textAlign: "center", textDecoration: "none" }}
                  >
                    📞 Call / WhatsApp
                  </a>
                )}
              </>
            )}

            {isOwner && (
              <Link to={`/edit-book/${book._id}`} className="btn-secondary" style={{ flex: 1, textAlign: "center", textDecoration: "none" }}>
                ✏️ Edit Listing & Photos
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Fullscreen Lightbox / Zoom Inspector */}
      <ImageLightbox
        images={allImages}
        initialIndex={selectedImageIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        bookTitle={book.title}
      />
    </div>
  );
};

export default BookDetail;
