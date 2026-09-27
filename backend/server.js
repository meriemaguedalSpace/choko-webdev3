const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const express = require("express");
const cors = require("cors");
const { runSeed } = require("./db/seed");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "..")));

app.use("/api/auth",      require("./routes/auth"));
app.use("/api/profile",   require("./routes/profile"));
app.use("/api/products",  require("./routes/products"));
app.use("/api/orders",    require("./routes/orders"));
app.use("/api/guestbook", require("./routes/guestbook"));
app.use("/api/blog",      require("./routes/blog"));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "ChokoNeko API is running 🐾" });
});

app.use("/api/*", (req, res) => {
  res.status(404).json({ error: "المسار غير موجود" });
});

app.use((err, req, res, _next) => {
  console.error("Server error:", err);
  res.status(500).json({ error: "خطأ داخلي في الخادم" });
});

runSeed()
  .then(() => {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🐾 ChokoNeko API running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to initialize database:", err);
    process.exit(1);
  });
