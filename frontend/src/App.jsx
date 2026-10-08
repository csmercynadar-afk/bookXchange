import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import PrivateRoute from "./components/PrivateRoute";

import Home from "./pages/Home";
import Login from "./pages/Login";
import SSOCallback from "./pages/SSOCallback";
import ClerkComplete from "./pages/ClerkComplete";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import BookDetail from "./pages/BookDetail";
import AddBook from "./pages/AddBook";
import MyListings from "./pages/MyListings";
import EditListing from "./pages/EditListing";
import Wishlist from "./pages/Wishlist";
import Reviews from "./pages/Reviews";
import About from "./pages/About";
import BookieChatbot from "./components/BookieChatbot";

function App() {
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Navbar />
      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/sso-callback" element={<SSOCallback />} />
          <Route path="/auth/clerk-complete" element={<ClerkComplete />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/about" element={<About />} />
          <Route path="/reviews" element={<Reviews />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/books/:id" element={<BookDetail />} />
          <Route
            path="/add-book"
            element={
              <PrivateRoute>
                <AddBook />
              </PrivateRoute>
            }
          />
          <Route
            path="/my-listings"
            element={
              <PrivateRoute>
                <MyListings />
              </PrivateRoute>
            }
          />
          <Route
            path="/edit-book/:id"
            element={
              <PrivateRoute>
                <EditListing />
              </PrivateRoute>
            }
          />
        </Routes>
      </main>
      <Footer />
      {/* Interactive College Book Assistant Chatbot */}
      <BookieChatbot />
    </div>
  );
}

export default App;
