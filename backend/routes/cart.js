const express = require("express");
const router = express.Router();
const db = require("../config/db");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/urun_ekle", authMiddleware, async (req, res) => {
  const user_id = req.session.user.id;
  const { product_id, quantity } = req.body;
  try {
    const [exist] = await db.query(
      "SELECT * FROM cart WHERE user_id = ? AND product_id = ?",
      [user_id, product_id]
    );
    if (exist.length > 0) {
      await db.query(
        "UPDATE cart SET quantity = quantity + ? WHERE user_id = ? AND product_id = ?",
        [quantity, user_id, product_id]
      );
    } else {
      await db.query(
        "INSERT INTO cart(user_id, product_id, quantity) VALUES (?, ?, ?)",
        [user_id, product_id, quantity]
      );
    }

   res.json({message:"üürn eklendi"})
  } catch (error) {
    console.log("ürün eklenirken bir hatayla karşılaşıldı", error);
    res.status(500).send("Sunucu bağlantı hatası");
  }
});

router.get("/listele/:user_id", authMiddleware, async (req, res) => {
  const user_id = req.session.user.id;

  try {
    const [data] = await db.query(
      `SELECT cart.id AS cart_id, cart.user_id, products.name, products.price, products.description, products.image, cart.quantity, products.stock 
       FROM cart 
       JOIN products ON cart.product_id = products.id
       WHERE cart.user_id = ?`,
      [user_id]
    );

    let topfiyat = 0;
    data.forEach((items) => {
      topfiyat += items.price * items.quantity;
    });
    topfiyat = parseFloat(topfiyat.toFixed(2));

    res.json({ data, topfiyat });
  } catch (error) {
    console.log("bilinmeyen bir hata : ", error);
    res.status(500).send("Sunucu bağlantı hatası");
  }
});

router.delete("/delete_sepet/:cart_id", async (req, res) => {
  const { cart_id } = req.params;

  try {
    const [ok] = await db.query("SELECT * FROM cart WHERE id = ?", [cart_id]);
    if (ok.length === 0) return res.status(404).send("Silinecek ürün zaten yok");

    await db.query("DELETE FROM cart WHERE id = ?", [cart_id]);
    res.json({message:"sepetten çıkarıldı" });
  } catch (error) {
    console.log("bilinmeyen bir hata : ", error);
    res.status(500).send("Silme işlemi başarısız");
  }
});

router.post("/guncelle", async (req, res) => {
  const { user_id, product_id, quantity } = req.body;

  try {
    await db.execute(
      "UPDATE cart SET quantity = ? WHERE user_id = ? AND product_id = ?",
      [quantity, user_id, product_id]
    );
    res.json({ success: true, topfiyat: topfiyat.toFixed(2) });
  } catch (error) {
    res.status(500).send("Sunucu bağlantı hatası");
  }
});

router.post("/quantity_arttir", async (req, res) => {
  const { cart_id } = req.body;

  try {
    await db.execute("UPDATE cart SET quantity = quantity + 1 WHERE id = ?", [cart_id]);

    const [[row]] = await db.query(
      `SELECT user_id FROM cart WHERE id = ?`,
      [cart_id]
    );

    const user_id = row.user_id;

    const [rows] = await db.query(
      `SELECT quantity, products.price FROM cart 
       JOIN products ON cart.product_id = products.id 
       WHERE cart.user_id = ?`, 
       [user_id]
    );

    let topfiyat = 0;
    rows.forEach(row => {
      topfiyat += row.quantity * row.price;
    });

    res.json({ success: true, topfiyat: topfiyat.toFixed(2) });
  } catch (err) {
    console.error("Artırma hatası:", err);
    res.status(500).json({ error: "Bir hata oluştu" });
  }
});


router.post("/quantity_azalt", async (req, res) => {
  const { cart_id } = req.body;

  try {
    await db.execute("UPDATE cart SET quantity = quantity - 1 WHERE id = ?", [cart_id]);

    const [[row]] = await db.query(
      `SELECT user_id FROM cart WHERE id = ?`,
      [cart_id]
    );

    const user_id = row.user_id;

    const [rows] = await db.query(
      `SELECT quantity, products.price FROM cart 
       JOIN products ON cart.product_id = products.id 
       WHERE cart.user_id = ?`, 
       [user_id]
    );

    let topfiyat = 0;
    rows.forEach(row => {
      topfiyat += row.quantity * row.price;
    });

    res.json({ success: true, topfiyat: topfiyat.toFixed(2) });
  } catch (err) {
    console.error("Azaltma hatası:", err);
    res.status(500).json({ error: "Bir hata oluştu" });
  }
});


module.exports = router;