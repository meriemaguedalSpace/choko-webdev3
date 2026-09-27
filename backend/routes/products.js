const express = require("express");
const { query } = require("../db/database");

const router = express.Router();

router.get("/", async (req, res) => {
  const { channel } = req.query;

  let result;
  if (channel && ["spacetoon", "disney", "nickelodeon"].includes(channel)) {
    result = await query(
      "SELECT id, name, price, img, channel, in_stock FROM products WHERE channel = $1 ORDER BY id ASC",
      [channel]
    );
  } else {
    result = await query(
      "SELECT id, name, price, img, channel, in_stock FROM products ORDER BY channel, id ASC"
    );
  }

  res.json(result.rows);
});

router.get("/:id", async (req, res) => {
  const result = await query(
    "SELECT id, name, price, img, channel, in_stock FROM products WHERE id = $1",
    [req.params.id]
  );

  if (!result.rows.length) {
    return res.status(404).json({ error: "المنتج غير موجود" });
  }

  res.json(result.rows[0]);
});

module.exports = router;
