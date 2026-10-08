import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useWishlist } from "../context/WishlistContext";
import { useAuth } from "../context/AuthContext";
import BookCard from "../components/BookCard";
import api from "../api/axios";
import BookCover from "../components/BookCover";

const Wishlist = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { wishlist, loading, fetchWishlist, alerts, addAlert, removeAlert } = useWishlist();

  const [activeTab, setActiveTab] = useState("wishlist");
  const [newKeyword, setNewKeyword] = useState("");
  const [alertSuccess, setAlertSuccess] = useState("");
  const [alertError, setAlertError] = useState("");
  const [submittingAlert, setSubmittingAlert] = useState(false);
  const [allBooks, setAllBooks] = useState([]);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    fetchWishlist();
    api
      .get("/books")
      .then(({ data }) => setAllBooks(data || []))
      .catch((err) => console.error(err));
  }, [user]);

  const handleAddAlertSubmit = async (e) => {
    e.preventDefault();
    setAlertSuccess("");
    setAlertError("");
    if (!newKeyword.trim()) return;
    setSubmittingAlert(true);
    const res = await addAlert(newKeyword.trim());
    setSubmittingAlert(false);
    if (res.success) {
      setAlertSuccess(res.message);
      setNewKeyword("");
      setTimeout(() => setAlertSuccess(""), 4000);
    } else {
      setAlertError(res.message || "Failed to add alert");
    }
  };

  return (
    <div className="container" style={{ paddingTop: 32, paddingBottom: 64 }}>
      {/* Header */}
      <div style={{
        background: "linear-gradient(135deg, #fff0f5 0%, #e8f5e9 100%)",
        borderRadius: 20, padding: "32px 24px", textAlign: "center",
        marginBottom: 32, border: "1px solid #f8d7da",
      }}>
        <span style={{ fontSize: 36, display: "block", marginBottom: 8 }}>💖 📚</span>
        <h1 style={{ margin: "0 0 8px", color: "#333", fontSize: 28 }}>My Wishlist & Book Alerts</h1>
        <p style={{ margin: 0, color: "#666", fontSize: 15, maxWidth: 600, marginInline: "auto" }}>
          Keep track of textbooks you want and get notified when a student lists a title you need.
        </p>

        {/* Tab Switcher */}
        <div style={{
          display: "inline-flex", background: "#fff", padding: 6,
          borderRadius: 30, boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
          marginTop: 24, gap: 8,
        }}>
          <button type="button" onClick={() => setActiveTab("wishlist")}
            className={activeTab === "wishlist" ? "btn-primary" : "btn-secondary"}
            style={{ borderRadius: 24, padding: "8px 20px", fontSize: 14, display: "flex", alignItems: "center", gap: 8 }}>
            <span>❤️ Saved Books</span>
            <span style={{
              background: activeTab === "wishlist" ? "rgba(255,255,255,0.3)" : "#e91e8c",
              color: "#fff", borderRadius: 12, padding: "2px 8px", fontSize: 12, fontWeight: "bold",
            }}>{wishlist.length}</span>
          </button>
          <button type="button" onClick={() => setActiveTab("alerts")}
            className={activeTab === "alerts" ? "btn-primary" : "btn-secondary"}
            style={{ borderRadius: 24, padding: "8px 20px", fontSize: 14, display: "flex", alignItems: "center", gap: 8 }}>
            <span>🔔 Title Alerts</span>
            <span style={{
              background: activeTab === "alerts" ? "rgba(255,255,255,0.3)" : "#2ecc71",
              color: "#fff", borderRadius: 12, padding: "2px 8px", fontSize: 12, fontWeight: "bold",
            }}>{alerts.length}</span>
          </button>
        </div>
      </div>

      {/* SAVED BOOKS TAB — uses same BookCard as Home page */}
      {activeTab === "wishlist" && (
        <div>
          {loading ? (
            <div style={{ textAlign: "center", padding: "48px 0" }}>
              <p style={{ color: "#888" }}>Loading your saved books...</p>
            </div>
          ) : wishlist.length === 0 ? (
            <div style={{
              textAlign: "center", padding: "64px 20px",
              background: "#fff", borderRadius: 16, border: "2px dashed #f0d6e8",
            }}>
              <div style={{ fontSize: 54, marginBottom: 12 }}>🌸</div>
              <h3 style={{ color: "#444", marginBottom: 8 }}>Your Wishlist is Empty</h3>
              <p style={{ color: "#777", maxWidth: 450, margin: "0 auto 24px" }}>
                Click the heart icon on any listing to save it here.
              </p>
              <Link to="/" className="btn-primary" style={{ textDecoration: "none" }}>
                Browse Available Books 🔍
              </Link>
            </div>
          ) : (
            <div className="book-grid">
              {wishlist.filter((b) => typeof b === "object" && b._id).map((book) => (
                <BookCard key={book._id} book={book} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ALERTS TAB */}
      {activeTab === "alerts" && (
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          {/* Create Alert */}
          <div style={{
            background: "#fff", border: "1px solid #c8e6c9", borderRadius: 16,
            padding: 24, boxShadow: "0 4px 16px rgba(46,204,113,0.08)", marginBottom: 32,
          }}>
            <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 12 }}>
              <span style={{ fontSize: 28 }}>🔔</span>
              <div>
                <h3 style={{ margin: 0, color: "#2e7d32" }}>Create Instant Book Alert</h3>
                <p style={{ margin: 0, fontSize: 13, color: "#666" }}>
                  Set a keyword and get notified when a matching book is listed!
                </p>
              </div>
            </div>

            {alertSuccess && <div className="form-success">{alertSuccess}</div>}
            {alertError && <div className="form-error">{alertError}</div>}

            <form onSubmit={handleAddAlertSubmit} style={{ display: "flex", gap: 12, marginTop: 16 }}>
              <input type="text" value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                placeholder="e.g. Operating Systems, Cormen, Harry Potter..."
                required style={{ flex: 1, margin: 0 }} />
              <button type="submit" className="btn-primary" disabled={submittingAlert}
                style={{
                  background: "linear-gradient(135deg, #2ecc71, #27ae60)",
                  borderColor: "#27ae60", whiteSpace: "nowrap",
                }}>
                {submittingAlert ? "Setting..." : "+ Set Alert 🔔"}
              </button>
            </form>

            <p style={{ fontSize: 12, color: "#888", marginTop: 10, marginBottom: 0 }}>
              💡 Whenever a seller posts a matching book, we'll notify <strong>{user?.email}</strong> automatically.
            </p>
          </div>

          {/* Active Alerts */}
          <h3 style={{ color: "#333", marginBottom: 16 }}>Active Keywords ({alerts.length})</h3>
          {alerts.length === 0 ? (
            <div style={{
              textAlign: "center", padding: "40px 20px", background: "#fbfbfb",
              borderRadius: 12, border: "1px dashed #ddd", color: "#777",
            }}>
              No alerts yet. Add keywords like your course code or favorite author above!
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {alerts.map((alert) => {
                const matchingBooks = allBooks.filter((b) =>
                  `${b.title} ${b.author} ${b.description}`.toLowerCase().includes(alert.keyword.toLowerCase())
                );
                return (
                  <div key={alert._id} style={{
                    background: "#fff", border: "1px solid #eef2f5", borderRadius: 12,
                    padding: "16px 20px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ fontSize: 18 }}>🏷️</span>
                          <strong style={{ fontSize: 16, color: "#2c3e50" }}>"{alert.keyword}"</strong>
                          <span style={{
                            fontSize: 11, background: "#e8f5e9", color: "#2e7d32",
                            padding: "2px 8px", borderRadius: 8, fontWeight: 600,
                          }}>Active</span>
                        </div>
                        <span style={{ fontSize: 12, color: "#999", marginTop: 4, display: "block" }}>
                          Created {new Date(alert.createdAt || Date.now()).toLocaleDateString()}
                        </span>
                      </div>
                      <button type="button" onClick={() => removeAlert(alert._id)}
                        className="btn-danger btn-small">🗑️ Delete</button>
                    </div>

                    {matchingBooks.length > 0 && (
                      <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid #f0f0f0" }}>
                        <span style={{ fontSize: 12, color: "#2ecc71", fontWeight: 600 }}>
                          🎉 {matchingBooks.length} match(es) available:
                        </span>
                        <div style={{ display: "flex", gap: 10, marginTop: 8, overflowX: "auto", paddingBottom: 4 }}>
                          {matchingBooks.map((mb) => (
                            <Link key={mb._id} to={`/books/${mb._id}`} style={{
                              display: "flex", alignItems: "center", gap: 8,
                              background: "#f8f9fa", padding: "6px 10px", borderRadius: 8,
                              textDecoration: "none", color: "#333", fontSize: 12,
                              border: "1px solid #eee", flexShrink: 0,
                            }}>
                              <BookCover src={mb.coverImageUrl} alt={mb.title} title={mb.title}
                                style={{ width: 24, height: 32, objectFit: "cover", borderRadius: 3 }} />
                              <div>
                                <div style={{ fontWeight: 600, maxWidth: 140, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                  {mb.title}
                                </div>
                                <div style={{ color: "#e91e8c", fontWeight: "bold" }}>₹{mb.price}</div>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
