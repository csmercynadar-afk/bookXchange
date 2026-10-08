import { useEffect, useState, useCallback } from "react";

// Looks for banner1.png ... banner5.png in /public/banner-images/
const CANDIDATE_FILES = [
  "/banner-images/banner1.png",
  "/banner-images/banner2.png",
  "/banner-images/banner3.png",
  "/banner-images/banner4.png",
  "/banner-images/banner5.png",
];

const BannerSlider = () => {
  const [images, setImages] = useState([]);
  const [current, setCurrent] = useState(0);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const checkImages = async () => {
      const valid = [];
      await Promise.all(
        CANDIDATE_FILES.map(
          (src) =>
            new Promise((resolve) => {
              const img = new Image();
              img.onload = () => { valid.push(src); resolve(); };
              img.onerror = () => resolve();
              img.src = src;
            })
        )
      );
      if (isMounted) {
        const ordered = CANDIDATE_FILES.filter((f) => valid.includes(f));
        setImages(ordered);
        setChecked(true);
      }
    };
    checkImages();
    return () => { isMounted = false; };
  }, []);

  const goTo = useCallback(
    (index) => {
      if (images.length === 0) return;
      setCurrent((index + images.length) % images.length);
    },
    [images.length]
  );

  useEffect(() => {
    if (images.length < 2) return;
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [images.length]);

  if (!checked || images.length === 0) return null;

  return (
    <div className="banner-slider">
      <div
        className="banner-slider-track"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {images.map((src, i) => (
          <img key={src} src={src} alt={`Promotional banner ${i + 1}`} className="banner-slide" />
        ))}
      </div>

      {images.length > 1 && (
        <>
          <button className="banner-arrow banner-arrow-left" onClick={() => goTo(current - 1)} aria-label="Previous banner">‹</button>
          <button className="banner-arrow banner-arrow-right" onClick={() => goTo(current + 1)} aria-label="Next banner">›</button>
          <div className="banner-dots">
            {images.map((_, i) => (
              <button
                key={i}
                className={`banner-dot ${i === current ? "active" : ""}`}
                onClick={() => goTo(i)}
                aria-label={`Go to banner ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default BannerSlider;
