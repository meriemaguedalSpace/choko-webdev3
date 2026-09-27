const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { query } = require("../db/database");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

function makeToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
}

router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: "جميع الحقول مطلوبة" });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: "كلمة المرور يجب أن تكون 8 أحرف على الأقل" });
  }

  const exists = await query("SELECT id FROM users WHERE email = $1", [email.toLowerCase()]);
  if (exists.rows.length > 0) {
    return res.status(409).json({ error: "البريد الإلكتروني مستخدم بالفعل" });
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const result = await query(
    "INSERT INTO users (username, email, password) VALUES ($1,$2,$3) RETURNING id, username, email",
    [username.trim(), email.toLowerCase().trim(), hashedPassword]
  );

  const user = result.rows[0];
  res.status(201).json({ token: makeToken(user), user });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "البريد الإلكتروني وكلمة المرور مطلوبان" });
  }

  const result = await query(
    "SELECT id, username, email, password FROM users WHERE email = $1",
    [email.toLowerCase().trim()]
  );

  if (!result.rows.length) {
    return res.status(401).json({ error: "البريد الإلكتروني أو كلمة المرور غير صحيحة" });
  }

  const user = result.rows[0];
  const match = await bcrypt.compare(password, user.password);

  if (!match) {
    return res.status(401).json({ error: "البريد الإلكتروني أو كلمة المرور غير صحيحة" });
  }

  res.json({ token: makeToken(user), user: { id: user.id, username: user.username, email: user.email } });
});

router.post("/change-password", requireAuth, async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: "الحقلان مطلوبان" });
  }
  if (newPassword.length < 8) {
    return res.status(400).json({ error: "كلمة المرور الجديدة يجب أن تكون 8 أحرف على الأقل" });
  }

  const result = await query("SELECT password FROM users WHERE id = $1", [req.user.id]);
  if (!result.rows.length) {
    return res.status(404).json({ error: "المستخدم غير موجود" });
  }

  const match = await bcrypt.compare(currentPassword, result.rows[0].password);
  if (!match) {
    return res.status(401).json({ error: "كلمة المرور الحالية غير صحيحة" });
  }

  const newHash = await bcrypt.hash(newPassword, 12);
  await query("UPDATE users SET password = $1 WHERE id = $2", [newHash, req.user.id]);

  res.json({ message: "تم تحديث كلمة المرور بنجاح ✅" });
});

module.exports = router;
