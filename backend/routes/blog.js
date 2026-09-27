const express = require("express");
const { query } = require("../db/database");

const router = express.Router();

router.get("/", async (req, res) => {
  const result = await query(
    "SELECT id, title, slug, excerpt, cover_img, created_at FROM blog_posts ORDER BY created_at DESC"
  );
  res.json(result.rows);
});

router.get("/:slug", async (req, res) => {
  const result = await query(
    "SELECT * FROM blog_posts WHERE slug = $1",
    [req.params.slug]
  );

  if (!result.rows.length) {
    return res.status(404).json({ error: "التدوينة غير موجودة" });
  }

  res.json(result.rows[0]);
});

module.exports = router;
