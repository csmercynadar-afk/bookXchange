import { useRef, useState } from "react";
import { uploadImageToCloudinary } from "../api/cloudinary";

// value: current coverImageUrl string
// onChange: (newUrl) => void
// label: optional slot label (e.g., "Main Cover", "Spine", "Inner Pages")
const ImageUploader = ({ value, onChange, label, onRemove }) => {
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState("");

  const processFile = async (file) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file (PNG, JPG, JPEG, WEBP).");
      return;
    }

    setError("");

    // Show an instant local preview while uploading to Cloudinary
    const localPreview = URL.createObjectURL(file);
    onChange(localPreview);

    setUploading(true);
    try {
      const hostedUrl = await uploadImageToCloudinary(file);
      onChange(hostedUrl);
    } catch (err) {
      setError(err.message || "Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    processFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    // Only set to false if leaving the container
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsDragging(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  return (
    <div className="image-uploader">
      {label && <span className="image-uploader-label">{label}</span>}
      <div
        className={`image-uploader-preview ${isDragging ? "dragging" : ""} ${value ? "has-image" : ""}`}
        onClick={() => fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        role="button"
        tabIndex={0}
      >
        {value ? (
          <>
            <img src={value} alt="Preview" />
            <div className="image-uploader-change-overlay">
              <span>📷 Drop or click to change</span>
            </div>
          </>
        ) : (
          <div className="image-uploader-placeholder">
            <span className="image-uploader-icon">{isDragging ? "✨" : "📷"}</span>
            <span className="image-uploader-text">
              {isDragging ? "Drop your image here!" : "Drag & drop image here or click to browse"}
            </span>
            <span className="image-uploader-hint">Supports PNG, JPG, WEBP</span>
          </div>
        )}
        {uploading && (
          <div className="image-uploader-overlay">
            <div className="uploader-spinner"></div>
            <span>Uploading to cloud...</span>
          </div>
        )}
      </div>

      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleFileSelect}
        style={{ display: "none" }}
      />

      <div style={{ display: "flex", gap: 8, marginTop: 8, alignItems: "center" }}>
        <button
          type="button"
          className="btn-secondary btn-small"
          onClick={() => fileInputRef.current?.click()}
        >
          {value ? "🔄 Change Photo" : "📁 Choose File"}
        </button>
        {value && onRemove && (
          <button
            type="button"
            className="btn-danger btn-small"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
          >
            ✕ Remove
          </button>
        )}
      </div>

      {error && <div className="form-error">{error}</div>}
    </div>
  );
};

export default ImageUploader;
