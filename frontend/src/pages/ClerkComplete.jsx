import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth as useClerkAuth } from "@clerk/clerk-react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import AuthLoader from "../components/AuthLoader";

// Exchanges the Clerk session for a normal BookXchange session (so wishlist, listings, etc. keep working).
const ClerkComplete = () => {
  const { isLoaded, isSignedIn, getToken } = useClerkAuth();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const started = useRef(false);

  useEffect(() => {
    if (!isLoaded || started.current) return;
    if (!isSignedIn) {
      navigate("/login?error=Google+sign-in+was+not+completed");
      return;
    }
    started.current = true;
    (async () => {
      try {
        const clerkToken = await getToken();
        const { data } = await api.post("/auth/clerk", null, {
          headers: { Authorization: `Bearer ${clerkToken}` },
        });
        login(data);
        navigate("/");
      } catch (err) {
        setError(err.response?.data?.message || "Could not complete Google sign-in.");
      }
    })();
  }, [isLoaded, isSignedIn, getToken, login, navigate]);

  if (error) {
    return (
      <div style={{ textAlign: "center", marginTop: 60 }}>
        <div className="form-error" style={{ display: "inline-block" }}>{error}</div>
        <p><a href="/login">Back to login</a></p>
      </div>
    );
  }
  return <AuthLoader />;
};

export default ClerkComplete;
