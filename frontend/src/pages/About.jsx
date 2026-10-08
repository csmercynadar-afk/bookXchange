const About = () => {
  return (
    <div className="page-container">
      <div className="about-hero">
        <div className="section-label">💗 Our Story</div>
        <h1>About BookXchange</h1>
        <p>
          A simple, dedicated marketplace for buying and selling second-hand books directly
          between readers — no middleman, no clutter, just books and good vibes.
        </p>
      </div>

      <div className="about-card">
        <h3>How It Works</h3>
        <div className="how-it-works-grid">
          <div className="how-step">
            <h4>1. Sign Up</h4>
            <p>Create a free account with your name, email, and phone number.</p>
          </div>
          <div className="how-step">
            <h4>2. List a Book</h4>
            <p>Upload a cover photo, set a fair price, and describe the condition.</p>
          </div>
          <div className="how-step">
            <h4>3. Get Contacted</h4>
            <p>Interested buyers view your listing and reach out to you directly.</p>
          </div>
          <div className="how-step">
            <h4>4. Sell & Earn</h4>
            <p>Negotiate the deal, hand over the book, and mark it as sold.</p>
          </div>
        </div>
      </div>

      <div className="about-card">
        <h3>Contact Us</h3>
        <p style={{ color: "var(--text-muted)", lineHeight: 1.7 }}>
          Have questions or feedback? We'd love to hear from you. Reach out at{" "}
          <a href="mailto:support@bookxchange.example.com" style={{ color: "var(--pink-deep)", fontWeight: 600 }}>
            support@bookxchange.example.com
          </a>
        </p>
      </div>
    </div>
  );
};

export default About;
