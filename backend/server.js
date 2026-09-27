require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
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

app.listen(PORT, () => {
  console.log(`🐾 ChokoNeko API running at http://localhost:${PORT}`);
});
