import { useState, useRef } from "react";
import { uploadImageToCloudinary } from "../api/cloudinary";

const SLOTS = [
  { label: "Spine Angle 📖", hint: "Show binding condition" },
  { label: "Back Cover 🔄", hint: "Show back of the book" },
  { label: "Sample Page ✍️", hint: "Show highlighting or notes" },
  { label: "Extra Angle 📸", hint: "Any notes or corner wear" },
];

const MultiImageUploader = ({
  coverImageUrl,
  onCoverChange,
  additionalImages = [],
  onAdditionalChange,
}) => {
  const mainInputRef = useRef(null);
  const [mainUploading, setMainUploading] = useState(false);
  const [mainDragging, setMainDragging] = useState(false);
  const [mainError, setMainError] = useState("");

  const [slotUploading, setSlotUploading] = useState({}); // { [index]: boolean }
  const [slotDragging, setSlotDragging] = useState({}); // { [index]: boolean }
  const slotInputRefs = useRef([]);

  // Main Cover Upload handler
  const handleMainFile = async (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setMainError("Please select a valid image (PNG, JPG, WEBP).");
      return;
    }
    setMainError("");
    const localUrl = URL.createObjectURL(file);
    onCoverChange(localUrl);

    setMainUploading(true);
    try {
      const cloudUrl = await uploadImageToCloudinary(file);
      onCoverChange(cloudUrl);
    } catch (err) {
      setMainError(err.message || "Upload failed");
    } finally {
      setMainUploading(false);
    }
  };

  // Additional Slot Upload handler
  const handleSlotFile = async (index, file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) return;

    const currentImages = [...(additionalImages || [])];
    const localUrl = URL.createObjectURL(file);
    currentImages[index] = localUrl;
    onAdditionalChange(currentImages);

    setSlotUploading((prev) => ({ ...prev, [index]: true }));
    try {
      const cloudUrl = await uploadImageToCloudinary(file);
      const updated = [...(additionalImages || [])];
      updated[index] = cloudUrl;
      onAdditionalChange(updated);
    } catch (err) {
      console.error("Slot upload error:", err);
    } finally {
      setSlotUploading((prev) => ({ ...prev, [index]: false }));
    }
  };

  const handleRemoveSlot = (index) => {
    const updated = [...(additionalImages || [])];
    updated.splice(index, 1);
    onAdditionalChange(updated.filter(Boolean));
  };

  return (
    <div className="multi-image-uploader" style={{ marginBottom: 20 }}>
      {/* 1. Main Cover Upload */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
          <label style={{ fontWeight: 600, color: "#333", margin: 0 }}>
            Main Cover Image <span style={{ color: "#e91e8c" }}>*</span>
          </label>
          <span style={{ fontSize: 12, color: "#666" }}>Primary photo displayed in search & listings</span>
        </div>

        <div
          className={`image-uploader-preview ${mainDragging ? "dragging" : ""} ${coverImageUrl ? "has-image" : ""}`}
          onClick={() => mainInputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setMainDragging(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            if (!e.currentTarget.contains(e.relatedTarget)) setMainDragging(false);
          }}
          onDrop={(e) => {
            e.preventDefault();
            setMainDragging(false);
            if (e.dataTransfer.files?.[0]) handleMainFile(e.dataTransfer.files[0]);
          }}
          role="button"
          tabIndex={0}
          style={{ minHeight: 180 }}
        >
          {coverImageUrl ? (
            <>
              <img src={coverImageUrl} alt="Main Cover" />
              <div className="image-uploader-change-overlay">
                <span>📷 Drag & drop or click to replace cover</span>
              </div>
            </>
          ) : (
            <div className="image-uploader-placeholder">
              <span className="image-uploader-icon">{mainDragging ? "✨" : "📚"}</span>
              <span className="image-uploader-text">
                {mainDragging ? "Drop cover image now!" : "Drag & drop Front Cover here or click to browse"}
              </span>
              <span className="image-uploader-hint">High resolution front cover (PNG, JPG, WEBP)</span>
            </div>
          )}
          {mainUploading && (
            <div className="image-uploader-overlay">
              <div className="uploader-spinner"></div>
              <span>Uploading to cloud...</span>
            </div>
          )}
        </div>

        <input
          type="file"
          accept="image/*"
          ref={mainInputRef}
          onChange={(e) => handleMainFile(e.target.files?.[0])}
          style={{ display: "none" }}
        />

        {mainError && <div className="form-error" style={{ marginTop: 6 }}>{mainError}</div>}
      </div>

      {/* 2. Additional Inspection Angles (Spine, Back, Pages) */}
      <div style={{ marginTop: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <label style={{ fontWeight: 600, color: "#333", margin: 0, fontSize: "14px" }}>
            Additional Book Angles & Condition Photos (Up to 4) 📸
          </label>
          <span style={{ fontSize: 12, color: "#2ecc71", fontWeight: 600 }}>
            Helps buyers inspect condition & sell 2x faster!
          </span>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
            gap: 12,
          }}
        >
          {SLOTS.map((slot, idx) => {
            const currentVal = (additionalImages || [])[idx];
            const isUploading = slotUploading[idx];
            const isDrag = slotDragging[idx];

            return (
              <div
                key={idx}
                style={{
                  border: isDrag ? "2px dashed #e91e8c" : "1.5px dashed #d1c4e9",
                  borderRadius: 12,
                  padding: 8,
                  background: isDrag ? "#fce4ec" : currentVal ? "#ffffff" : "#fafafa",
                  position: "relative",
                  textAlign: "center",
                  cursor: "pointer",
                  minHeight: 140,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  transition: "all 0.2s ease",
                }}
                onClick={() => slotInputRefs.current[idx]?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  setSlotDragging((p) => ({ ...p, [idx]: true }));
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  if (!e.currentTarget.contains(e.relatedTarget)) {
                    setSlotDragging((p) => ({ ...p, [idx]: false }));
                  }
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  setSlotDragging((p) => ({ ...p, [idx]: false }));
                  if (e.dataTransfer.files?.[0]) handleSlotFile(idx, e.dataTransfer.files[0]);
                }}
              >
                {currentVal ? (
                  <div style={{ position: "relative", width: "100%", height: 110 }}>
                    <img
                      src={currentVal}
                      alt={slot.label}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        borderRadius: 8,
                      }}
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveSlot(idx);
                      }}
                      style={{
                        position: "absolute",
                        top: -6,
                        right: -6,
                        background: "#f44336",
                        color: "#fff",
                        border: "none",
                        borderRadius: "50%",
                        width: 22,
                        height: 22,
                        fontSize: 12,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
                      }}
                      title="Remove photo"
                    >
                      ✕
                    </button>
                    <span
                      style={{
                        fontSize: 10,
                        color: "#666",
                        display: "block",
                        marginTop: 4,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {slot.label}
                    </span>
                  </div>
                ) : (
                  <div>
                    <div style={{ fontSize: 20, marginBottom: 4 }}>{isDrag ? "✨" : "➕"}</div>
                    <strong style={{ fontSize: 12, color: "#555", display: "block" }}>{slot.label}</strong>
                    <span style={{ fontSize: 10, color: "#888", display: "block", marginTop: 2 }}>
                      {slot.hint}
                    </span>
                  </div>
                )}

                {isUploading && (
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background: "rgba(255,255,255,0.85)",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: 12,
                    }}
                  >
                    <div className="uploader-spinner" style={{ width: 24, height: 24, borderWidth: 2 }}></div>
                    <span style={{ fontSize: 11, color: "#e91e8c", marginTop: 4 }}>Uploading...</span>
                  </div>
                )}

                <input
                  type="file"
                  accept="image/*"
                  ref={(el) => (slotInputRefs.current[idx] = el)}
                  onChange={(e) => handleSlotFile(idx, e.target.files?.[0])}
                  style={{ display: "none" }}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MultiImageUploader;
