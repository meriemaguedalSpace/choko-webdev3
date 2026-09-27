const express = require("express");
const { query } = require("../db/database");
const { requireAuth, optionalAuth } = require("../middleware/auth");

const router = express.Router();

router.post("/", optionalAuth, async (req, res) => {
  const { full_name, phone, wilaya, commune, address, instagram, notes, items, total_price } = req.body;

  if (!full_name || !phone || !wilaya || !commune) {
    return res.status(400).json({ error: "الاسم والهاتف والولاية والبلدية مطلوبة" });
  }
  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "لا توجد منتجات في الطلب" });
  }

  const user_id = req.user ? req.user.id : null;
  const items_json = JSON.stringify(items);

  const result = await query(
    `INSERT INTO orders
      (user_id, full_name, phone, wilaya, commune, address, instagram, notes, items_json, total_price)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
     RETURNING id`,
    [
      user_id,
      full_name.trim(),
      phone.trim(),
      wilaya.trim(),
      commune.trim(),
      (address || "").trim(),
      (instagram || "").trim(),
      (notes || "").trim(),
      items_json,
      Number(total_price) || 0
    ]
  );

  res.status(201).json({ message: "تم استلام طلبك بنجاح ✅", order_id: result.rows[0].id });
});

router.get("/my", requireAuth, async (req, res) => {
  const result = await query(
    `SELECT id, full_name, phone, wilaya, commune, address, instagram, notes,
            items_json, total_price, status, created_at
     FROM orders WHERE user_id = $1 ORDER BY created_at DESC`,
    [req.user.id]
  );

  const orders = result.rows.map((o) => ({
    ...o,
    items: JSON.parse(o.items_json || "[]")
  }));

  res.json(orders);
});

router.get("/:id", requireAuth, async (req, res) => {
  const result = await query(
    "SELECT * FROM orders WHERE id = $1 AND user_id = $2",
    [req.params.id, req.user.id]
  );

  if (!result.rows.length) {
    return res.status(404).json({ error: "الطلب غير موجود" });
  }

  const order = result.rows[0];
  order.items = JSON.parse(order.items_json || "[]");

  res.json(order);
});

module.exports = router;
