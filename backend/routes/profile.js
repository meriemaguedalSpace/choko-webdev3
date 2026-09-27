const express = require("express");
const { query } = require("../db/database");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.get("/", requireAuth, async (req, res) => {
  const result = await query(
    "SELECT id, username, email, phone, instagram, wilaya, commune, address, bio, avatar_b64, created_at FROM users WHERE id = $1",
    [req.user.id]
  );

  if (!result.rows.length) {
    return res.status(404).json({ error: "المستخدم غير موجود" });
  }

  res.json(result.rows[0]);
});

router.put("/", requireAuth, async (req, res) => {
  const { username, phone, instagram, wilaya, commune, address, bio, avatar_b64 } = req.body;

  await query(
    `UPDATE users SET
      username   = COALESCE($1, username),
      phone      = COALESCE($2, phone),
      instagram  = COALESCE($3, instagram),
      wilaya     = COALESCE($4, wilaya),
      commune    = COALESCE($5, commune),
      address    = COALESCE($6, address),
      bio        = COALESCE($7, bio),
      avatar_b64 = COALESCE($8, avatar_b64)
    WHERE id = $9`,
    [
      username   ? username.trim()  : null,
      phone      ? phone.trim()     : null,
      instagram  ? instagram.trim() : null,
      wilaya     ? wilaya.trim()    : null,
      commune    ? commune.trim()   : null,
      address    ? address.trim()   : null,
      bio        ? bio.trim()       : null,
      avatar_b64 || null,
      req.user.id
    ]
  );

  const result = await query(
    "SELECT id, username, email, phone, instagram, wilaya, commune, address, bio, avatar_b64, created_at FROM users WHERE id = $1",
    [req.user.id]
  );

  res.json({ message: "تم حفظ التغييرات بنجاح ✅", user: result.rows[0] });
});

module.exports = router;
