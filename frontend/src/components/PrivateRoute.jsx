import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <p style={{ textAlign: "center", marginTop: "40px" }}>Loading...</p>;

  return user ? children : <Navigate to="/login" replace />;
};

export default PrivateRoute;
