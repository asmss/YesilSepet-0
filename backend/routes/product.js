const express = require("express");
const router = express.Router();
const db = require("../config/db");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/listele", authMiddleware, async (req, res) => {
  try {
    const [veriler] = await db.query("SELECT * FROM products");
    res.render("index", { products: veriler }); 
  } catch (err) {
    console.log("Veritabanına bağlanırken bir sorun oluştu:", err);
    res.status(500).send("Sunucu bağlantı hatası");
  }
});

router.post("/ekle", async (req, res) => {
  const { name, description, price, image, stock } = req.body;
  try {
    await db.query(
      "INSERT INTO products (name, description, price, image, stock) VALUES (?, ?, ?, ?, ?)",
      [name, description, price, image, stock]
    );
    res.redirect("/products/listele"); 
  } catch (error) {
    console.log("Ürün eklenirken bir hata oluştu:", error);
    res.status(500).send("Sunucu hatası");
  }
});

router.post("/update/:id", async (req, res) => {
  const { id } = req.params;
  const { name, description, price, image, stock } = req.body;
  try {
    await db.query(
      "UPDATE products SET name = ?, description = ?, price = ?, image = ?, stock = ? WHERE id = ?",
      [name, description, price, image, stock, id]
    );
    res.redirect("/products/listele");
  } catch (error) {
    console.log("Güncelleme hatası:", error);
    res.status(500).send("Sunucu hatası");
  }
});

router.post("/delete/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await db.query("DELETE FROM products WHERE id = ?", [id]);
    res.redirect("/products/listele");
  } catch (error) {
    console.log("Silme hatası:", error);
    res.status(500).send("Sunucu hatası");
  }
});

module.exports = router;
