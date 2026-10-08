import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import MultiImageUploader from "../components/MultiImageUploader";

const AddBook = () => {
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    price: "",
    condition: "Good",
    description: "",
    coverImageUrl: "",
    additionalImages: [],
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCoverChange = (url) => {
    setFormData((prev) => ({ ...prev, coverImageUrl: url }));
  };

  const handleAdditionalChange = (images) => {
    setFormData((prev) => ({ ...prev, additionalImages: images }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.coverImageUrl) {
      setError("Please add a front cover photo before posting.");
      return;
    }

    setLoading(true);
    try {
      await api.post("/books", {
        ...formData,
        price: Number(formData.price),
        additionalImages: (formData.additionalImages || []).filter(Boolean),
      });
      navigate("/my-listings");
    } catch (err) {
      setError(err.response?.data?.message || "Could not create listing. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-page">
      <div className="form-card" style={{ maxWidth: 640 }}>
        <h2>Sell a Book 📚</h2>
        <p className="form-subtitle">
          List your textbook with high quality photos so campus buyers can inspect and contact you quickly.
        </p>
        {error && <div className="form-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <label>Book Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g. Introduction to Algorithms"
            required
          />

          <label>Author</label>
          <input
            type="text"
            name="author"
            value={formData.author}
            onChange={handleChange}
            placeholder="e.g. Thomas H. Cormen"
            required
          />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label>Price (₹)</label>
              <input
                type="number"
                name="price"
                min="0"
                value={formData.price}
                onChange={handleChange}
                placeholder="e.g. 350"
                required
              />
            </div>
            <div>
              <label>Condition</label>
              <select name="condition" value={formData.condition} onChange={handleChange}>
                <option value="New">New</option>
                <option value="Like New">Like New</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
                <option value="Worn">Worn</option>
              </select>
            </div>
          </div>

          {/* Multi-angle drag & drop uploader */}
          <MultiImageUploader
            coverImageUrl={formData.coverImageUrl}
            onCoverChange={handleCoverChange}
            additionalImages={formData.additionalImages}
            onAdditionalChange={handleAdditionalChange}
          />

          <label>Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Any extra details — edition, notes inside, why you're selling, meeting spot on campus, etc."
            rows="3"
          />

          <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: 8 }}>
            {loading ? "Publishing Listing..." : "Post Listing Free 🌸"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddBook;
