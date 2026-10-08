const AuthLoader = ({ text = "Signing you in..." }) => (
  <div
    style={{
      position: "fixed", inset: 0, background: "#fff", zIndex: 9999,
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14,
    }}
  >
    <img src="/logo/logo_icon.png" alt="BookXchange" style={{ height: 64, width: "auto" }} />
    <div style={{ fontWeight: 600, color: "#e91e8c" }}>{text}</div>
  </div>
);

export default AuthLoader;
