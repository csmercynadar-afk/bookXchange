import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useWishlist } from "../context/WishlistContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const { wishlistCount } = useWishlist();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-logo">
        <img src="/logo/logo_icon.png" alt="BookXchange logo" width="44" height="44" />
        <span className="navbar-logo-text">BookXchange</span>
      </Link>

      <div className="navbar-links">
        <Link to="/">Home</Link>
        <Link to="/reviews">Reviews ⭐</Link>

        {user ? (
          <>
            <Link to="/wishlist" style={{ position: "relative", display: "inline-flex", alignItems: "center", gap: 4 }}>
              <span>Wishlist ❤️</span>
              {wishlistCount > 0 && (
                <span
                  style={{
                    background: "#e91e8c",
                    color: "#fff",
                    fontSize: 11,
                    fontWeight: "bold",
                    borderRadius: 10,
                    padding: "1px 6px",
                    lineHeight: "14px",
                  }}
                >
                  {wishlistCount}
                </span>
              )}
            </Link>
            <Link to="/add-book">Sell a Book</Link>
            <Link to="/my-listings">My Listings</Link>
            <span className="navbar-user">Hi, {user.name.split(" ")[0]} 👋</span>
            <button className="btn-link" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/about">About</Link>
            <Link to="/login">Login</Link>
            <Link to="/signup" className="navbar-cta">
              Sign Up Free
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
