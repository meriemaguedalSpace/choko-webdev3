const express = require("express");
const { query } = require("../db/database");

const router = express.Router();

router.get("/", async (req, res) => {
  const result = await query(
    "SELECT id, name, message, created_at FROM guestbook ORDER BY created_at DESC LIMIT 50"
  );
  res.json(result.rows);
});

router.post("/", async (req, res) => {
  const { name, message } = req.body;

  if (!name || !message) {
    return res.status(400).json({ error: "الاسم والرسالة مطلوبان" });
  }
  if (name.trim().length > 60) {
    return res.status(400).json({ error: "الاسم طويل جداً (60 حرف كحد أقصى)" });
  }
  if (message.trim().length > 500) {
    return res.status(400).json({ error: "الرسالة طويلة جداً (500 حرف كحد أقصى)" });
  }

  const result = await query(
    "INSERT INTO guestbook (name, message) VALUES ($1,$2) RETURNING id, name, message, created_at",
    [name.trim(), message.trim()]
  );

  res.status(201).json(result.rows[0]);
});

module.exports = router;
