import { createContext, useContext, useState, useEffect } from "react";
import api from "../api/axios";
import { useAuth } from "./AuthContext";

const WishlistContext = createContext();

export const useWishlist = () => useContext(WishlistContext);

export const WishlistProvider = ({ children }) => {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState([]); // Array of populated book objects or book IDs
  const [wishlistIds, setWishlistIds] = useState(new Set());
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchWishlist = async () => {
    if (!user) {
      setWishlist([]);
      setWishlistIds(new Set());
      return;
    }
    try {
      setLoading(true);
      const { data } = await api.get("/wishlist");
      setWishlist(data || []);
      const idSet = new Set((data || []).map((b) => (b._id ? b._id : b)));
      setWishlistIds(idSet);
    } catch (error) {
      console.error("Failed to fetch wishlist:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchAlerts = async () => {
    if (!user) {
      setAlerts([]);
      return;
    }
    try {
      const { data } = await api.get("/wishlist/alerts");
      setAlerts(data || []);
    } catch (error) {
      console.error("Failed to fetch alerts:", error.message);
    }
  };

  useEffect(() => {
    if (user) {
      fetchWishlist();
      fetchAlerts();
    } else {
      setWishlist([]);
      setWishlistIds(new Set());
      setAlerts([]);
    }
  }, [user]);

  const toggleWishlist = async (bookId) => {
    if (!user) {
      return { success: false, requireAuth: true };
    }
    try {
      const { data } = await api.post(`/wishlist/toggle/${bookId}`);
      if (data.inWishlist) {
        setWishlistIds((prev) => new Set([...prev, bookId]));
      } else {
        setWishlistIds((prev) => {
          const next = new Set(prev);
          next.delete(bookId);
          return next;
        });
        setWishlist((prev) => prev.filter((b) => (b._id || b) !== bookId));
      }
      return { success: true, inWishlist: data.inWishlist };
    } catch (error) {
      console.error("Toggle wishlist error:", error.message);
      return { success: false, error: error.message };
    }
  };

  const isWishlisted = (bookId) => {
    return wishlistIds.has(bookId);
  };

  const addAlert = async (keyword) => {
    if (!user) return { success: false, requireAuth: true };
    try {
      const { data } = await api.post("/wishlist/alerts", { keyword });
      setAlerts(data.alerts || []);
      return { success: true, message: data.message };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || "Failed to add alert" };
    }
  };

  const removeAlert = async (alertId) => {
    try {
      const { data } = await api.delete(`/wishlist/alerts/${alertId}`);
      setAlerts(data.alerts || []);
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || "Failed to remove alert" };
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        wishlistIds,
        wishlistCount: wishlistIds.size,
        alerts,
        loading,
        toggleWishlist,
        isWishlisted,
        fetchWishlist,
        addAlert,
        removeAlert,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};
