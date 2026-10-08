import { useEffect, useState } from "react";

// Builds an inline SVG "cover" so we never depend on a third-party placeholder site
// (via.placeholder.com has been shut down, which is why broken covers showed up blank).
const makePlaceholder = (title = "No Cover") => {
  const safe = String(title).slice(0, 38).replace(/[<>&"']/g, "");
  const words = safe.split(" ");
  const lines = [];
  let line = "";
  words.forEach((w) => {
    if ((line + " " + w).trim().length > 14) {
      lines.push(line.trim());
      line = w;
    } else {
      line = (line + " " + w).trim();
    }
  });
  if (line) lines.push(line);
  const text = lines
    .slice(0, 4)
    .map((l, i) => `<text x="100" y="${150 + i * 22}" text-anchor="middle" font-family="Arial,sans-serif" font-size="15" font-weight="700" fill="#c2185b">${l}</text>`)
    .join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="280" viewBox="0 0 200 280">
    <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fce4ec"/><stop offset="1" stop-color="#f8bbd0"/></linearGradient></defs>
    <rect width="200" height="280" fill="url(#g)"/>
    <rect x="0" y="0" width="12" height="280" fill="#e91e8c" opacity=".55"/>
    <text x="100" y="95" text-anchor="middle" font-size="46">📖</text>${text}</svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

// OpenLibrary returns a 1x1 blank GIF (HTTP 200) for unknown covers unless ?default=false is set.
const normalizeSrc = (src) => {
  if (!src || typeof src !== "string") return "";
  const url = src.trim();
  if (/^https?:\/\/covers\.openlibrary\.org\//i.test(url) && !/[?&]default=/.test(url)) {
    return url + (url.includes("?") ? "&" : "?") + "default=false";
  }
  return url;
};

const BookCover = ({ src, alt, title, className, style, onClick }) => {
  const normalized = normalizeSrc(src);
  const [failed, setFailed] = useState(!normalized);

  useEffect(() => {
    setFailed(!normalized);
  }, [normalized]);

  return (
    <img
      src={failed ? makePlaceholder(title || alt) : normalized}
      alt={alt || title || "Book cover"}
      className={className}
      style={style}
      onClick={onClick}
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      onLoad={(e) => {
        // tiny 1x1 "blank" images count as broken too
        if (!failed && e.target.naturalWidth <= 1) setFailed(true);
      }}
    />
  );
};

export default BookCover;
