import { useState, useEffect } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const AVAILABLE_TAGS = [
  "Saved Money 💰",
  "Great Condition 📖",
  "Fast Handover ⚡",
  "Safe Campus Deal 🤝",
  "Friendly Seller 🌸",
  "Exact Match 🎯",
];

const Reviews = () => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({
    totalReviews: 0,
    averageRating: 5.0,
    ratingCounts: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
  });
  const [loading, setLoading] = useState(true);
  const [filterStar, setFilterStar] = useState("all");

  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [formData, setFormData] = useState({
    name: user?.name || "",
    role: "",
    rating: 5,
    title: "",
    comment: "",
    tags: [],
  });

  const fetchReviews = async () => {
    try {
      const { data } = await api.get("/reviews");
      setReviews(data.reviews || []);
      if (data.stats) setStats(data.stats);
    } catch (err) {
      console.error("Error loading reviews:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReviews(); }, []);

  useEffect(() => {
    if (user) setFormData((prev) => ({ ...prev, name: user.name }));
  }, [user]);

  const handleTagToggle = (tag) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter((t) => t !== tag)
        : [...prev.tags, tag],
    }));
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");
    if (!formData.name.trim() || !formData.title.trim() || !formData.comment.trim()) {
      setFormError("Please fill out all required fields.");
      return;
    }
    setSubmitting(true);
    try {
      const { data } = await api.post("/reviews", formData);
      setFormSuccess(data.message || "Review posted successfully! 🌸");
      setShowModal(false);
      setFormData({ name: user?.name || "", role: "", rating: 5, title: "", comment: "", tags: [] });
      fetchReviews();
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to post review. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredReviews = reviews.filter((r) =>
    filterStar === "all" ? true : Math.round(r.rating) === Number(filterStar)
  );

  const ratingLabel = {
    5: "Outstanding Experience! 🌟",
    4: "Very Good Deal 👍",
    3: "Average Experience 😐",
    2: "Could Be Better 👎",
    1: "Poor Experience 💔",
  };

  return (
    <div style={{ maxWidth: 1040, margin: "0 auto", padding: "32px 16px 64px" }}>

      {/* ── Hero Header ── */}
      <div style={{
        background: "linear-gradient(135deg, #fff0f5 0%, #f0fdf4 100%)",
        borderRadius: 24, padding: "36px 28px",
        border: "1px solid #f8d7da", marginBottom: 36,
        boxShadow: "0 6px 24px rgba(233,30,140,0.06)",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 20 }}>
          <div style={{ maxWidth: 540 }}>
            <span style={{ fontSize: 13, background: "#fce4ec", color: "#e91e8c", padding: "4px 12px", borderRadius: 20, fontWeight: 700 }}>
              🎓 CAMPUS TRUST & TRANSPARENCY
            </span>
            <h1 style={{ fontSize: 30, color: "#2c3e50", margin: "12px 0 8px" }}>
              Community Ratings & Reviews 🌟
            </h1>
            <p style={{ color: "#666", fontSize: 15, lineHeight: 1.6, margin: 0 }}>
              Authentic feedback from students buying and selling textbooks on campus. Share yours to help fellow students!
            </p>
          </div>
          <button type="button" onClick={() => setShowModal(true)} className="btn-primary"
            style={{ padding: "12px 24px", fontSize: 15, boxShadow: "0 4px 14px rgba(233,30,140,0.3)" }}>
            ✍️ Write a Review
          </button>
        </div>

        {/* Stats row */}
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 20, marginTop: 28, paddingTop: 24, borderTop: "1px solid #f0d6e8",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ fontSize: 52, fontWeight: 900, color: "#e91e8c", lineHeight: 1 }}>
              {stats.averageRating ? stats.averageRating.toFixed(1) : "5.0"}
            </div>
            <div>
              <div style={{ color: "#f39c12", fontSize: 20, letterSpacing: 2 }}>
                {"★".repeat(Math.round(stats.averageRating || 5))}
                {"☆".repeat(5 - Math.round(stats.averageRating || 5))}
              </div>
              <span style={{ fontSize: 13, color: "#666", fontWeight: 600 }}>
                Based on {stats.totalReviews} student reviews
              </span>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            {[5, 4, 3, 2, 1].map((star) => {
              const count = stats.ratingCounts?.[star] || 0;
              const pct = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;
              return (
                <div key={star} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}>
                  <span style={{ width: 32, color: "#555", fontWeight: 600 }}>{star} ★</span>
                  <div style={{ flex: 1, height: 8, background: "#e0e0e0", borderRadius: 4, overflow: "hidden" }}>
                    <div style={{ width: `${pct}%`, height: "100%", background: star >= 4 ? "#2ecc71" : "#f39c12", borderRadius: 4 }} />
                  </div>
                  <span style={{ width: 20, textAlign: "right", color: "#888" }}>{count}</span>
                </div>
              );
            })}
          </div>

          <div style={{ background: "#fff", padding: "14px 18px", borderRadius: 14, border: "1px solid #e8f5e9" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <span style={{ fontSize: 20 }}>🛡️</span>
              <strong style={{ fontSize: 14, color: "#2e7d32" }}>100% Peer Verified</strong>
            </div>
            <p style={{ margin: 0, fontSize: 12, color: "#666", lineHeight: 1.5 }}>
              All reviews come from students doing real campus book exchanges.
            </p>
          </div>
        </div>
      </div>

      {/* ── Filter Tabs ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {[
            { label: "All Reviews", val: "all" },
            { label: "⭐⭐⭐⭐⭐ 5 Stars", val: "5" },
            { label: "⭐⭐⭐⭐ 4 Stars", val: "4" },
            { label: "⭐⭐⭐ 3 Stars", val: "3" },
          ].map((tab) => (
            <button key={tab.val} type="button"
              onClick={() => setFilterStar(tab.val)}
              className={filterStar === tab.val ? "btn-primary btn-small" : "btn-secondary btn-small"}
              style={{ borderRadius: 20 }}>
              {tab.label}
            </button>
          ))}
        </div>
        <span style={{ fontSize: 13, color: "#777" }}>
          Showing <strong>{filteredReviews.length}</strong> review(s)
        </span>
      </div>

      {/* ── Reviews Grid — centred ── */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "48px 0" }}>
          <p style={{ color: "#888" }}>Loading community reviews...</p>
        </div>
      ) : filteredReviews.length === 0 ? (
        <div style={{ textAlign: "center", padding: "48px 20px", background: "#fff", borderRadius: 16, border: "1px dashed #ddd" }}>
          <p style={{ color: "#777" }}>No reviews for this filter yet.</p>
        </div>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: 20,
          justifyItems: "stretch",
        }}>
          {filteredReviews.map((rev) => (
            <div key={rev._id} style={{
              background: "#fff", border: "1px solid #f0e6eb", borderRadius: 18,
              padding: "20px 22px", boxShadow: "0 3px 12px rgba(0,0,0,0.04)",
              display: "flex", flexDirection: "column", justifyContent: "space-between",
            }}>
              <div>
                {/* Reviewer row */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{
                      width: 42, height: 42, borderRadius: "50%",
                      background: "linear-gradient(135deg, #fce4ec, #e8f5e9)",
                      color: "#e91e8c", fontWeight: "bold", fontSize: 16,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      border: "2px solid #f8bbd0", flexShrink: 0,
                    }}>
                      {rev.name?.charAt(0).toUpperCase() || "S"}
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: 14, color: "#2c3e50" }}>{rev.name}</h4>
                      <span style={{ fontSize: 12, color: "#999" }}>{rev.role || "Verified Student"}</span>
                    </div>
                  </div>
                  {rev.verifiedDeal && (
                    <span style={{
                      fontSize: 11, background: "#e8f5e9", color: "#2e7d32",
                      padding: "2px 8px", borderRadius: 10, fontWeight: 600, whiteSpace: "nowrap",
                    }}>✓ Verified</span>
                  )}
                </div>

                {/* Stars + date */}
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                  <span style={{ color: "#f39c12", fontSize: 15 }}>{"★".repeat(rev.rating)}{"☆".repeat(5 - rev.rating)}</span>
                  <span style={{ fontSize: 11, color: "#bbb" }}>• {new Date(rev.createdAt || Date.now()).toLocaleDateString()}</span>
                </div>

                <h4 style={{ margin: "0 0 6px", fontSize: 14, color: "#333", fontWeight: 700 }}>{rev.title}</h4>
                <p style={{ margin: 0, fontSize: 13, color: "#666", lineHeight: 1.6 }}>"{rev.comment}"</p>
              </div>

              {rev.tags?.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 14, paddingTop: 12, borderTop: "1px solid #f5f5f5" }}>
                  {rev.tags.map((tag, i) => (
                    <span key={i} style={{
                      fontSize: 11, background: "#fdf5f8", color: "#c2185b",
                      padding: "3px 9px", borderRadius: 8, border: "1px solid #f8bbd0",
                    }}>{tag}</span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── Write a Review Modal ── */}
      {showModal && (
        <div
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
            zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center",
            padding: 16, backdropFilter: "blur(4px)",
          }}
          onClick={() => setShowModal(false)}
        >
          <div
            style={{
              background: "#fff", borderRadius: 20, width: "100%", maxWidth: 520,
              maxHeight: "90vh", overflowY: "auto",
              boxShadow: "0 16px 40px rgba(0,0,0,0.18)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div style={{
              background: "linear-gradient(135deg, #e91e8c, #ff80ab)",
              borderRadius: "20px 20px 0 0", padding: "20px 24px",
              display: "flex", justifyContent: "space-between", alignItems: "center",
            }}>
              <div>
                <h2 style={{ margin: 0, fontSize: 20, color: "#fff", fontWeight: 700 }}>Write a Review 🌸</h2>
                <p style={{ margin: 0, fontSize: 13, color: "rgba(255,255,255,0.85)", marginTop: 2 }}>
                  Share your BookXchange experience
                </p>
              </div>
              <button type="button" onClick={() => setShowModal(false)}
                style={{
                  background: "rgba(255,255,255,0.2)", border: "none", color: "#fff",
                  borderRadius: "50%", width: 32, height: 32, cursor: "pointer",
                  fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center",
                }}>✕</button>
            </div>

            <div style={{ padding: "24px 28px" }}>
              {formError && <div className="form-error" style={{ marginBottom: 14 }}>{formError}</div>}
              {formSuccess && <div className="form-success" style={{ marginBottom: 14 }}>{formSuccess}</div>}

              <form onSubmit={handleSubmitReview}>

                {/* Step 1: Star rating */}
                <div style={{
                  background: "#fff8fb", border: "1px solid #fce4ec",
                  borderRadius: 14, padding: "16px", marginBottom: 20, textAlign: "center",
                }}>
                  <p style={{ margin: "0 0 10px", fontWeight: 600, color: "#555", fontSize: 14 }}>
                    How was your experience?
                  </p>
                  <div style={{ display: "flex", justifyContent: "center", gap: 6, marginBottom: 8 }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button key={star} type="button"
                        onClick={() => setFormData({ ...formData, rating: star })}
                        style={{
                          background: "none", border: "none", fontSize: 36, cursor: "pointer",
                          color: star <= formData.rating ? "#f39c12" : "#ddd",
                          transition: "transform 0.15s",
                          padding: "0 2px",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.25)")}
                        onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}>
                        ★
                      </button>
                    ))}
                  </div>
                  <span style={{ fontSize: 13, color: "#e91e8c", fontWeight: 700 }}>
                    {ratingLabel[formData.rating]}
                  </span>
                </div>

                {/* Step 2: Name + Role */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
                  {[
                    { label: "Your Name", icon: "👤", key: "name", placeholder: "e.g. Priya Sharma", required: true },
                    { label: "Branch / Year", icon: "🎓", key: "role", placeholder: "e.g. CSE 3rd Year", required: false },
                  ].map(({ label, icon, key, placeholder, required }) => (
                    <div key={key}>
                      <label style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 700, color: "#555", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                        <span>{icon}</span> {label} {required && <span style={{ color: "#e91e8c" }}>*</span>}
                      </label>
                      <div style={{
                        display: "flex", alignItems: "center",
                        background: "#fdf6fa", border: "1.5px solid #f0d6e8",
                        borderRadius: 12, overflow: "hidden",
                        transition: "border-color 0.2s",
                      }}
                        onFocusCapture={(e) => e.currentTarget.style.borderColor = "#e91e8c"}
                        onBlurCapture={(e) => e.currentTarget.style.borderColor = "#f0d6e8"}
                      >
                        <input type="text"
                          value={formData[key]}
                          onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                          placeholder={placeholder}
                          required={required}
                          style={{
                            flex: 1, border: "none", outline: "none",
                            background: "transparent", padding: "11px 14px",
                            fontSize: 13, color: "#333", margin: 0,
                          }} />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Step 3: Headline */}
                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 700, color: "#555", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    <span>✏️</span> Review Headline <span style={{ color: "#e91e8c" }}>*</span>
                  </label>
                  <div style={{
                    background: "#fdf6fa", border: "1.5px solid #f0d6e8",
                    borderRadius: 12, overflow: "hidden",
                  }}
                    onFocusCapture={(e) => e.currentTarget.style.borderColor = "#e91e8c"}
                    onBlurCapture={(e) => e.currentTarget.style.borderColor = "#f0d6e8"}
                  >
                    <input type="text" value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g. Saved ₹500 on CLRS and it was in perfect condition!"
                      required
                      style={{
                        width: "100%", border: "none", outline: "none",
                        background: "transparent", padding: "11px 14px",
                        fontSize: 13, color: "#333", margin: 0, boxSizing: "border-box",
                      }} />
                  </div>
                </div>

                {/* Step 4: Detailed Experience */}
                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 700, color: "#555", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    <span>💬</span> Detailed Experience <span style={{ color: "#e91e8c" }}>*</span>
                  </label>
                  <div style={{
                    background: "#fdf6fa", border: "1.5px solid #f0d6e8",
                    borderRadius: 12, overflow: "hidden",
                  }}
                    onFocusCapture={(e) => e.currentTarget.style.borderColor = "#e91e8c"}
                    onBlurCapture={(e) => e.currentTarget.style.borderColor = "#f0d6e8"}
                  >
                    <textarea value={formData.comment}
                      onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                      placeholder="Tell us how the handover went, the book's condition, and why you'd recommend BookXchange to a friend..."
                      rows={4} required
                      style={{
                        width: "100%", border: "none", outline: "none",
                        background: "transparent", padding: "11px 14px",
                        fontSize: 13, color: "#333", margin: 0,
                        resize: "vertical", boxSizing: "border-box",
                        fontFamily: "inherit", lineHeight: 1.6,
                      }} />
                  </div>
                </div>

                {/* Step 5: Tags */}
                <div style={{ marginBottom: 24 }}>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#555", marginBottom: 8 }}>
                    Experience Tags <span style={{ fontWeight: 400, color: "#999" }}>(optional)</span>
                  </label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {AVAILABLE_TAGS.map((tag) => {
                      const sel = formData.tags.includes(tag);
                      return (
                        <button key={tag} type="button" onClick={() => handleTagToggle(tag)}
                          style={{
                            background: sel ? "#fce4ec" : "#f5f5f5",
                            color: sel ? "#e91e8c" : "#666",
                            border: sel ? "1.5px solid #e91e8c" : "1.5px solid #e0e0e0",
                            padding: "6px 13px", borderRadius: 20, fontSize: 12,
                            cursor: "pointer", fontWeight: sel ? 600 : 400,
                            transition: "all 0.15s",
                          }}>
                          {sel ? `✓ ${tag}` : `+ ${tag}`}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", paddingTop: 4 }}>
                  <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary" disabled={submitting}>
                    {submitting ? "Posting..." : "Publish Review 🌸"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reviews;
