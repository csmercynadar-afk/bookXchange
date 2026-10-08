require("dotenv").config();
const mongoose = require("mongoose");

mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 10000,
})
  .then((c) => {
    console.log("CONNECTED:", c.connection.host);
    process.exit(0);
  })
  .catch((e) => {
    console.error("NAME:", e.name);
    console.error("CODE:", e.code);
    console.error("MSG:", e.message);
    if (e.errorLabels) console.error("LABELS:", e.errorLabels);
    if (e.reason) console.error("REASON:", JSON.stringify(e.reason));
    if (e.stack) console.error("STACK:", e.stack);
    process.exit(1);
  });
