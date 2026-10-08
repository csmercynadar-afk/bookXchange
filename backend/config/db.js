const dns = require("dns");
const mongoose = require("mongoose");

const connect = () =>
  mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 15000 });

const printHints = (error) => {
  console.error(`\n❌ MongoDB connection failed: ${error.message}\n`);
  const msg = `${error.message} ${error.code || ""} ${error.syscall || ""}`;

  if (/querySrv|ENOTFOUND|ECONNREFUSED/i.test(msg)) {
    console.error("   → DNS problem: your network/ISP is blocking the 'mongodb+srv' lookup.");
    console.error("     Fix: switch Windows DNS to 8.8.8.8 / 1.1.1.1, or use the non-SRV");
    console.error("     'Standard connection string' from Atlas (Connect → Drivers → 'I need the older string').");
  }
  if (/whitelist|not allowed|IP|Server selection timed out|ReplicaSetNoPrimary/i.test(msg)) {
    console.error("   → Atlas is probably rejecting your IP. Atlas → Network Access → Add IP Address");
    console.error("     → 'Allow access from anywhere' (0.0.0.0/0) for development. Wait ~1 min, retry.");
  }
  if (/auth|bad auth|Authentication failed/i.test(msg)) {
    console.error("   → Wrong DB username/password in MONGO_URI. If the password has special characters");
    console.error("     (@ : / ? # %) they must be URL-encoded, e.g. @ → %40.");
  }
  if (/paused|ENOTFOUND/i.test(msg)) {
    console.error("   → Free Atlas clusters pause after inactivity: open Atlas and click 'Resume'.");
  }
  console.error("");
};

const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    console.error("❌ MONGO_URI is missing. Add it to backend/.env");
    process.exit(1);
  }

  try {
    const conn = await connect();
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return;
  } catch (firstError) {
    // Very common on Windows/Node 18+: SRV DNS lookups fail on some networks.
    // Retry once using public DNS resolvers.
    if (/querySrv|ECONNREFUSED|ETIMEOUT|ENOTFOUND/i.test(`${firstError.message} ${firstError.code}`)) {
      console.warn("⚠️  MongoDB lookup failed, retrying with public DNS (8.8.8.8 / 1.1.1.1)...");
      try {
        dns.setServers(["8.8.8.8", "1.1.1.1"]);
        await mongoose.disconnect().catch(() => {});
        const conn = await connect();
        console.log(`✅ MongoDB Connected (via public DNS): ${conn.connection.host}`);
        return;
      } catch (secondError) {
        printHints(secondError);
        process.exit(1);
      }
    }
    printHints(firstError);
    process.exit(1);
  }
};

module.exports = connectDB;
