const features = [
  {
    icon: "📚",
    title: "Wide Selection",
    text: "Second-hand books across every genre, posted directly by fellow readers.",
  },
  {
    icon: "💰",
    title: "Honest Pricing",
    text: "No middlemen, no markups — buy and sell at prices you both agree on.",
  },
  {
    icon: "🤝",
    title: "Direct Contact",
    text: "Message sellers directly to ask questions and settle the deal yourself.",
  },
  {
    icon: "🌱",
    title: "Give Books a Second Life",
    text: "Keep good books in circulation instead of gathering dust on a shelf.",
  },
];

const WhyChooseUs = () => {
  return (
    <section className="why-us-section">
      <div className="section-label">✨ Why Us</div>
      <h2>Why Choose BookXchange?</h2>
      <p className="why-us-subtitle">A simple, student-friendly way to buy and sell books.</p>
      <div className="why-us-grid">
        {features.map((f) => (
          <div className="why-us-card" key={f.title}>
            <span className="why-us-icon">{f.icon}</span>
            <h3>{f.title}</h3>
            <p>{f.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default WhyChooseUs;
