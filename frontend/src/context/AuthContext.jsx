import { createContext, useContext, useState, useEffect } from "react";
import api from "../api/axios";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = (userData) => {
    localStorage.setItem("token", userData.token);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (err) {
      // Ignore logout errors
    }
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    // also end the Clerk session so "Continue with Google" works again next time
    try { await window.Clerk?.signOut?.(); } catch (err) { /* ignore */ }
  };

  const updateToken = async () => {
    try {
      const { data } = await api.post("/auth/refresh");
      localStorage.setItem("token", data.token);
      return data.token;
    } catch (err) {
      logout();
      return null;
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateToken, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
