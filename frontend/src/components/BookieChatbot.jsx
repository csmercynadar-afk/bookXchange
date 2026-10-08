import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";

const QUICK_SUGGESTIONS = [
  "🔍 Find books under ₹300",
  "💻 Computer Science books",
  "📖 How do I sell a book?",
  "🛡️ Is campus exchange safe?",
  "🔔 How do alerts work?",
  "⭐ Community Reviews",
];

const BookieChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Hi there! I'm Bookie 🎀, your campus book finder & marketplace guide. Ask me anything about buying, selling, or finding books on campus!",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend) => {
    const query = (textToSend || input).trim();
    if (!query) return;

    const userMsg = {
      sender: "user",
      text: query,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    try {
      // Send message + conversation history to Groq-powered backend
      const { data } = await api.post("/chat", {
        message: query,
        history: messages, // full history for context
      });

      const botMsg = {
        sender: "bot",
        text: data.reply,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      const errMsg = {
        sender: "bot",
        text: "Oops, I'm having a little trouble connecting right now. Please try again in a moment! 🌸",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          style={{
            position: "fixed",
            bottom: 24,
            right: 24,
            zIndex: 900,
            background: "linear-gradient(135deg, #e91e8c, #f06292)",
            color: "#fff",
            border: "none",
            borderRadius: "50%",
            width: 58,
            height: 58,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 8px 24px rgba(233,30,140,0.35)",
            cursor: "pointer",
            transition: "transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          title="Chat with Bookie 🎀"
        >
          <span style={{ fontSize: 26 }}>🎀</span>
          {/* Online dot */}
          <span
            style={{
              position: "absolute",
              top: 2,
              right: 2,
              background: "#2ecc71",
              borderRadius: "50%",
              width: 13,
              height: 13,
              border: "2px solid #fff",
            }}
          />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div
          style={{
            position: "fixed",
            bottom: 24,
            right: 24,
            width: 360,
            maxWidth: "calc(100vw - 32px)",
            height: 520,
            maxHeight: "calc(100vh - 48px)",
            background: "#ffffff",
            borderRadius: 20,
            boxShadow: "0 12px 40px rgba(0,0,0,0.18)",
            zIndex: 999,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            border: "1px solid #f8d7da",
          }}
        >
          {/* Header */}
          <div
            style={{
              background: "linear-gradient(135deg, #e91e8c 0%, #ff80ab 100%)",
              color: "#fff",
              padding: "14px 18px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexShrink: 0,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: "50%",
                  background: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 20,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                  flexShrink: 0,
                }}
              >
                🎀
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: 15, fontWeight: "bold" }}>Bookie 🌸</h4>
                <span style={{ fontSize: 11, opacity: 0.9, display: "flex", alignItems: "center", gap: 4 }}>
                  <span
                    style={{
                      display: "inline-block",
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: "#a8e6cf",
                    }}
                  />
                  AI Campus Assistant · Powered by Llama 3
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              style={{
                background: "rgba(255,255,255,0.2)",
                border: "none",
                color: "#fff",
                borderRadius: "50%",
                width: 28,
                height: 28,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 14,
                flexShrink: 0,
              }}
            >
              ✕
            </button>
          </div>

          {/* Messages Feed */}
          <div
            style={{
              flex: 1,
              padding: 16,
              overflowY: "auto",
              background: "#fdf8fa",
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            {messages.map((m, idx) => (
              <div
                key={idx}
                style={{
                  alignSelf: m.sender === "user" ? "flex-end" : "flex-start",
                  maxWidth: "85%",
                }}
              >
                <div
                  style={{
                    background: m.sender === "user" ? "#e91e8c" : "#ffffff",
                    color: m.sender === "user" ? "#ffffff" : "#333333",
                    padding: "10px 14px",
                    borderRadius:
                      m.sender === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
                    fontSize: 13.5,
                    lineHeight: 1.55,
                    border: m.sender === "user" ? "none" : "1px solid #f0e6eb",
                    whiteSpace: "pre-line",
                  }}
                >
                  {m.text}
                </div>
                <span
                  style={{
                    fontSize: 10,
                    color: "#bbb",
                    marginTop: 3,
                    display: "block",
                    textAlign: m.sender === "user" ? "right" : "left",
                    paddingInline: 4,
                  }}
                >
                  {m.time}
                </span>
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div style={{ alignSelf: "flex-start" }}>
                <div
                  style={{
                    background: "#fff",
                    border: "1px solid #f0e6eb",
                    padding: "10px 16px",
                    borderRadius: "16px 16px 16px 4px",
                    display: "flex",
                    gap: 5,
                    alignItems: "center",
                  }}
                >
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      style={{
                        width: 7,
                        height: 7,
                        borderRadius: "50%",
                        background: "#e91e8c",
                        display: "inline-block",
                        animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick suggestion chips */}
          <div
            style={{
              padding: "8px 12px",
              background: "#fff",
              borderTop: "1px solid #f0e6eb",
              display: "flex",
              gap: 6,
              overflowX: "auto",
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            {QUICK_SUGGESTIONS.map((chip, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(chip)}
                style={{
                  background: "#fff5f8",
                  border: "1px solid #f8bbd0",
                  color: "#d81b60",
                  borderRadius: 14,
                  padding: "4px 10px",
                  fontSize: 11,
                  cursor: "pointer",
                  flexShrink: 0,
                  whiteSpace: "nowrap",
                }}
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Input bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            style={{
              padding: "10px 14px",
              background: "#fff",
              display: "flex",
              gap: 8,
              alignItems: "center",
              borderTop: "1px solid #f0e6eb",
              flexShrink: 0,
            }}
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Bookie anything about books..."
              disabled={isTyping}
              style={{
                flex: 1,
                border: "1px solid #ddd",
                borderRadius: 20,
                padding: "8px 14px",
                fontSize: 13,
                outline: "none",
                margin: 0,
                background: isTyping ? "#fafafa" : "#fff",
              }}
            />
            <button
              type="submit"
              disabled={isTyping || !input.trim()}
              style={{
                background: isTyping || !input.trim()
                  ? "#ddd"
                  : "linear-gradient(135deg, #e91e8c, #f06292)",
                border: "none",
                borderRadius: "50%",
                width: 36,
                height: 36,
                padding: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 15,
                cursor: isTyping || !input.trim() ? "not-allowed" : "pointer",
                color: "#fff",
                flexShrink: 0,
                transition: "background 0.2s",
              }}
            >
              ➔
            </button>
          </form>
        </div>
      )}

      {/* Bounce animation for typing dots */}
      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-6px); }
        }
      `}</style>
    </>
  );
};

export default BookieChatbot;
