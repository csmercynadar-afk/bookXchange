import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import MultiImageUploader from "../components/MultiImageUploader";

const EditListing = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const { data } = await api.get(`/books/${id}`);
        setFormData({
          title: data.title,
          author: data.author,
          price: data.price,
          condition: data.condition,
          description: data.description,
          coverImageUrl: data.coverImageUrl,
          additionalImages: data.additionalImages || [],
          status: data.status,
        });
      } catch (err) {
        setError(err.response?.data?.message || "Could not load this listing.");
      } finally {
        setFetching(false);
      }
    };
    fetchBook();
  }, [id]);

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
    setLoading(true);
    try {
      await api.put(`/books/${id}`, {
        ...formData,
        price: Number(formData.price),
        additionalImages: (formData.additionalImages || []).filter(Boolean),
      });
      navigate("/my-listings");
    } catch (err) {
      setError(err.response?.data?.message || "Could not update listing. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <p className="status-text">Loading...</p>;
  if (error && !formData) return <p className="status-text form-error">{error}</p>;
  if (!formData) return null;

  return (
    <div className="form-page">
      <div className="form-card" style={{ maxWidth: 640 }}>
        <h2>Edit Listing ✏️</h2>
        <p className="form-subtitle">Update your book's details, photos, or mark it as sold</p>
        {error && <div className="form-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <label>Book Title</label>
          <input type="text" name="title" value={formData.title} onChange={handleChange} required />

          <label>Author</label>
          <input type="text" name="author" value={formData.author} onChange={handleChange} required />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label>Price (₹)</label>
              <input
                type="number"
                name="price"
                min="0"
                value={formData.price}
                onChange={handleChange}
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
            rows="3"
          />

          <label>Listing Status</label>
          <select name="status" value={formData.status} onChange={handleChange}>
            <option value="available">🟢 Available for Sale</option>
            <option value="sold">🔴 Sold</option>
          </select>

          <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: 8 }}>
            {loading ? "Saving Changes..." : "Save Changes 🌸"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditListing;
