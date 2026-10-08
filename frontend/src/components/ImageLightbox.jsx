import { useState, useEffect } from "react";

const ImageLightbox = ({ images = [], initialIndex = 0, isOpen, onClose, bookTitle }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoomLevel, setZoomLevel] = useState(1);

  useEffect(() => {
    setCurrentIndex(initialIndex);
    setZoomLevel(1);
  }, [initialIndex, isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "ArrowLeft") handlePrev();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, currentIndex, images.length]);

  if (!isOpen || images.length === 0) return null;

  const currentImage = images[currentIndex] || images[0];

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
    setZoomLevel(1);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    setZoomLevel(1);
  };

  const zoomIn = () => setZoomLevel((z) => Math.min(z + 0.35, 3));
  const zoomOut = () => setZoomLevel((z) => Math.max(z - 0.35, 0.7));
  const resetZoom = () => setZoomLevel(1);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(18, 18, 24, 0.92)",
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "20px",
        backdropFilter: "blur(6px)",
      }}
      onClick={onClose}
    >
      {/* Top Bar */}
      <div
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          color: "#fff",
          maxWidth: 1100,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          <h4 style={{ margin: 0, fontSize: "16px", color: "#fce4ec" }}>
            {bookTitle ? `Inspecting: ${bookTitle}` : "Book Photo Inspection"}
          </h4>
          <span style={{ fontSize: "12px", color: "#bbb" }}>
            Image {currentIndex + 1} of {images.length}
          </span>
        </div>

        {/* Zoom Controls */}
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <button
            type="button"
            onClick={zoomOut}
            title="Zoom Out"
            style={{
              background: "rgba(255,255,255,0.15)",
              border: "1px solid rgba(255,255,255,0.3)",
              color: "#fff",
              borderRadius: 8,
              padding: "6px 12px",
              cursor: "pointer",
              fontSize: 16,
            }}
          >
            🔍 -
          </button>
          <button
            type="button"
            onClick={resetZoom}
            title="Reset Zoom"
            style={{
              background: "rgba(255,255,255,0.15)",
              border: "1px solid rgba(255,255,255,0.3)",
              color: "#fff",
              borderRadius: 8,
              padding: "6px 12px",
              cursor: "pointer",
              fontSize: 13,
            }}
          >
            {Math.round(zoomLevel * 100)}%
          </button>
          <button
            type="button"
            onClick={zoomIn}
            title="Zoom In"
            style={{
              background: "rgba(255,255,255,0.15)",
              border: "1px solid rgba(255,255,255,0.3)",
              color: "#fff",
              borderRadius: 8,
              padding: "6px 12px",
              cursor: "pointer",
              fontSize: 16,
            }}
          >
            🔍 +
          </button>
          <button
            type="button"
            onClick={onClose}
            title="Close (Esc)"
            style={{
              background: "#e91e8c",
              border: "none",
              color: "#fff",
              borderRadius: 8,
              padding: "6px 16px",
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: 14,
              marginLeft: 8,
            }}
          >
            ✕ Close
          </button>
        </div>
      </div>

      {/* Main Image Area with Zoom */}
      <div
        style={{
          position: "relative",
          flex: 1,
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          margin: "16px 0",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Prev Button */}
        {images.length > 1 && (
          <button
            type="button"
            onClick={handlePrev}
            style={{
              position: "absolute",
              left: 20,
              background: "rgba(0,0,0,0.5)",
              color: "#fff",
              border: "1px solid rgba(255,255,255,0.3)",
              borderRadius: "50%",
              width: 44,
              height: 44,
              fontSize: 20,
              cursor: "pointer",
              zIndex: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ‹
          </button>
        )}

        <div
          style={{
            transform: `scale(${zoomLevel})`,
            transition: "transform 0.2s ease-out",
            maxHeight: "75vh",
            maxWidth: "85vw",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <img
            src={currentImage}
            alt="Inspection"
            style={{
              maxHeight: "75vh",
              maxWidth: "85vw",
              objectFit: "contain",
              borderRadius: 8,
              boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
            }}
          />
        </div>

        {/* Next Button */}
        {images.length > 1 && (
          <button
            type="button"
            onClick={handleNext}
            style={{
              position: "absolute",
              right: 20,
              background: "rgba(0,0,0,0.5)",
              color: "#fff",
              border: "1px solid rgba(255,255,255,0.3)",
              borderRadius: "50%",
              width: 44,
              height: 44,
              fontSize: 20,
              cursor: "pointer",
              zIndex: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ›
          </button>
        )}
      </div>

      {/* Bottom Thumbnail Strip */}
      {images.length > 1 && (
        <div
          style={{
            display: "flex",
            gap: 12,
            background: "rgba(255,255,255,0.1)",
            padding: "8px 16px",
            borderRadius: 14,
            overflowX: "auto",
            maxWidth: "90vw",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {images.map((img, idx) => (
            <img
              key={idx}
              src={img}
              alt={`thumb-${idx}`}
              onClick={() => {
                setCurrentIndex(idx);
                setZoomLevel(1);
              }}
              style={{
                width: 50,
                height: 65,
                objectFit: "cover",
                borderRadius: 6,
                cursor: "pointer",
                border: idx === currentIndex ? "2px solid #e91e8c" : "2px solid transparent",
                opacity: idx === currentIndex ? 1 : 0.6,
                transition: "all 0.2s ease",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageLightbox;
