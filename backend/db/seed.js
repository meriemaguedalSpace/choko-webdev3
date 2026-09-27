require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });
const { query } = require("./database");

async function runSeed() {
  await query(`
    CREATE TABLE IF NOT EXISTS users (
      id          SERIAL PRIMARY KEY,
      username    TEXT    NOT NULL,
      email       TEXT    NOT NULL UNIQUE,
      password    TEXT    NOT NULL,
      phone       TEXT,
      instagram   TEXT,
      wilaya      TEXT,
      commune     TEXT,
      address     TEXT,
      bio         TEXT,
      avatar_b64  TEXT,
      created_at  TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS products (
      id          SERIAL PRIMARY KEY,
      name        TEXT    NOT NULL,
      price       INTEGER NOT NULL,
      img         TEXT    NOT NULL,
      channel     TEXT    NOT NULL CHECK(channel IN ('spacetoon','disney','nickelodeon')),
      in_stock    INTEGER NOT NULL DEFAULT 1,
      created_at  TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS orders (
      id          SERIAL PRIMARY KEY,
      user_id     INTEGER REFERENCES users(id),
      full_name   TEXT    NOT NULL,
      phone       TEXT    NOT NULL,
      wilaya      TEXT    NOT NULL,
      commune     TEXT    NOT NULL,
      address     TEXT,
      instagram   TEXT,
      notes       TEXT,
      items_json  TEXT    NOT NULL,
      total_price INTEGER NOT NULL,
      status      TEXT    NOT NULL DEFAULT 'pending',
      created_at  TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS guestbook (
      id          SERIAL PRIMARY KEY,
      name        TEXT    NOT NULL,
      message     TEXT    NOT NULL,
      created_at  TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS blog_posts (
      id          SERIAL PRIMARY KEY,
      title       TEXT    NOT NULL,
      slug        TEXT    NOT NULL UNIQUE,
      excerpt     TEXT,
      content     TEXT    NOT NULL,
      cover_img   TEXT,
      created_at  TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  const { rows: productCount } = await query("SELECT COUNT(*) AS cnt FROM products");
  if (parseInt(productCount[0].cnt) === 0) {
    const spacetoon = [
      ["Rimy & Mateo sticker", 350, "assets/products/rimy & mateo.png"],
      ["Hunter x hunter sticker", 150, "assets/products/hunter x hunter.png"],
      ["نجمة الطبخ sticker", 300, "assets/products/cooking idol.png"],
      ["نجمة الطبخ poster", 700, "assets/products/poster.png"],
      ["نجمة الطبخ photocard", 300, "assets/products/photocard.png"],
      ["Doramon sticker", 150, "assets/products/doramon.png"],
      ["Emily sticker", 200, "assets/products/emily.png"],
      ["ايروكا sticker", 200, "assets/products/eroka.png"],
      ["katties sticker", 200, "assets/products/katties.png"],
      ["البؤساء : كوزيت & ايبونين sticker", 200, "assets/products/cosette n ebonin.png"],
      ["البؤساء : ازيلما sticker", 150, "assets/products/azelma.png"],
      ["Strawberry shortcake sticker", 200, "assets/products/shortcake.png"],
      ["مغامرات نغم sticker", 200, "assets/products/nagham.png"],
      ["عهد الاصدقاء sticker", 200, "assets/products/romeo.png"],
      ["سالي sticker", 200, "assets/products/sally.png"],
      ["sandy bell sticker", 150, "assets/products/sandybel.png"],
      ["بائعة الكبريت sticker", 150, "assets/products/meskina.png"],
      ["محققوا الحيوانات sticker sheet", 350, "assets/products/animal.png"],
      ["دروبي مع دوريمي sticker sheet", 350, "assets/products/dorobi.png"],
      ["Jewelpet twinkle Rinko & Akari sticker sheet", 350, "assets/products/pink.png"],
      ["Jewelpet twinkle Aoi & Sara sticker sheet", 350, "assets/products/blue.png"],
      ["Jewelpet twinkle Minami & Miria sticker sheet", 350, "assets/products/green.png"],
      ["Detective Conan sticker sheet", 350, "assets/products/conan.png"],
      ["Inyusha sticker sheet", 250, "assets/products/inyusha.png"],
      ["ينبوع الاحلام sticker sheet", 250, "assets/products/red.png"],
      ["دريلاند sticker sheet", 250, "assets/products/dryland.png"],
      ["همتارو sticker sheet", 250, "assets/products/hamtaro.png"],
      ["BookMark Dryland: Dafina & Milo", 300, "assets/products/Dafina & Milo.png"],
      ["BookMark: Jewelpet Twinkle season 1", 300, "assets/products/jewelpet friends.png"]
    ];
    const disney = [
      ["Miraculous Adrienette sticker", 200, "assets/products/miraculous.png"],
      ["Miraculous Chatnoir sticker", 200, "assets/products/chatnoir.png"]
    ];
    const nickelodeon = [
      ["Sam & Cat", 300, "assets/products/samandcat.png"]
    ];

    for (const [n, p, i] of spacetoon) {
      await query("INSERT INTO products (name, price, img, channel) VALUES ($1,$2,$3,$4)", [n, p, i, "spacetoon"]);
    }
    for (const [n, p, i] of disney) {
      await query("INSERT INTO products (name, price, img, channel) VALUES ($1,$2,$3,$4)", [n, p, i, "disney"]);
    }
    for (const [n, p, i] of nickelodeon) {
      await query("INSERT INTO products (name, price, img, channel) VALUES ($1,$2,$3,$4)", [n, p, i, "nickelodeon"]);
    }
    console.log("✅ Products seeded.");
  }

  const { rows: blogCount } = await query("SELECT COUNT(*) AS cnt FROM blog_posts");
  if (parseInt(blogCount[0].cnt) === 0) {
    await query(
      "INSERT INTO blog_posts (title, slug, excerpt, content) VALUES ($1,$2,$3,$4)",
      [
        "مرحباً بكم في مدونة شوكونيكو! 🐾",
        "welcome-to-chokoneko",
        "أول تدوينة لنا نشارككم فيها قصة شوكو وعالمه الساحر.",
        "أهلاً وسهلاً بكم في مدونة شوكونيكو! هنا سنشارككم كل جديد من منتجاتنا وأحداثنا وذكرياتنا الجميلة. ابقوا معنا لتكونوا أول من يعرف! 🌸"
      ]
    );
    await query(
      "INSERT INTO blog_posts (title, slug, excerpt, content) VALUES ($1,$2,$3,$4)",
      [
        "طلبيات ما قبل البيع متاحة الآن ⚡",
        "pre-orders-open",
        "يمكنكم الآن إرسال طلباتكم المسبقة على أحدث منتجاتنا.",
        "سعداء بإعلانكم أن طلبيات ما قبل البيع باتت متاحة الآن! لا تفوّتوا الفرصة وتواصلوا معنا عبر الانستغرام أو من خلال المتجر مباشرةً. 🛒✨"
      ]
    );
    console.log("✅ Blog posts seeded.");
  }

  const { rows: gbCount } = await query("SELECT COUNT(*) AS cnt FROM guestbook");
  if (parseInt(gbCount[0].cnt) === 0) {
    await query(
      "INSERT INTO guestbook (name, message) VALUES ($1,$2)",
      ["شوكونيكو", "♡ شوكونيكو هو أكثر من مجرد متجر، إنه مكان يحيي الذكريات ويخلق لحظات لا تُنسى! ♡"]
    );
    console.log("✅ Guestbook seeded.");
  }

  console.log("✅ Database ready.");
}

if (require.main === module) {
  runSeed().then(() => process.exit(0)).catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  });
}

module.exports = { runSeed };
