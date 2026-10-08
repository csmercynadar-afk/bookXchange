import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <img src="/logo/logo_image.png" alt="BookXchange" />
          <div className="footer-brand-name">BookXchange</div>
          <p>A student-friendly marketplace for buying and selling second-hand books. Give your books a second life!</p>
          <div style={{ marginTop: 12, display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.8)", padding: "4px 12px", borderRadius: 20, border: "1px solid #f8bbd0" }}>
            <span style={{ color: "#f39c12", fontSize: 13 }}>★★★★★</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#e91e8c" }}>4.9/5.0 Campus Rating</span>
          </div>
        </div>

        <div className="footer-col">
          <h4>Navigate</h4>
          <Link to="/">Home</Link>
          <Link to="/about">About</Link>
          <Link to="/reviews">Community Reviews 🌟</Link>
          <Link to="/add-book">Sell a Book</Link>
          <Link to="/my-listings">My Listings</Link>
        </div>

        <div className="footer-col">
          <h4>Buyer & Seller Hub</h4>
          <Link to="/wishlist">Wishlist & Alerts 🔔</Link>
          <Link to="/reviews">Read Student Reviews ⭐</Link>
          <Link to="/login">Login</Link>
          <Link to="/signup">Sign Up Free</Link>
        </div>
      </div>

      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} BookXchange. Made with 💗 for book lovers.</span>
        <span>Built by <span>Mercy</span></span>
      </div>
    </footer>
  );
};

export default Footer;
