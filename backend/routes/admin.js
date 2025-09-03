const express = require("express");
const router = express.Router();
const isAdmin = require("../middleware/isAdmin");
const db = require("../config/db");

router.get("/products", isAdmin, async (req, res) => {
  try {
    const [products] = await db.query("SELECT * FROM products");
    res.render("admin/products", { products });
  } catch (err) {
    res.status(500).send("Veri alınamadı");
  }
});

router.get("/products/new", isAdmin, (req, res) => {
  res.render("admin/newProduct");
});

router.post("/products", isAdmin, async (req, res) => {
  const { name, description,image, price, stock } = req.body;
  try {
    await db.query(
      "INSERT INTO products (name, description, image,price, stock) VALUES (?, ?, ?, ?, ?)",
      [name, description, image,price, stock]
    );
    res.json({ message: "Ürün başarıyla eklendi" });
  } catch (err) {
    res.status(500).json({ message: "Ürün eklenemedi" });
  }
});

router.delete("/products/delete/:id", isAdmin, async (req, res) => {
  const product_id = req.params.id;
  try {
    await db.query("DELETE FROM products WHERE id = ?", [product_id]);
    res.redirect("/admin/products");
  } catch (err) {
    res.status(500).send("Ürün silinemedi");
  }
});

router.get("/products/edit/:id", isAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.query("SELECT * FROM products WHERE id = ?", [id]);
    if (rows.length === 0) {
      return res.status(404).send("Ürün bulunamadı");
    }
    const product = rows[0];
    res.render("admin/editProduct", { product });
  } catch (err) {
    res.status(500).send("Ürün bilgisi alınamadı");
  }
});

router.put("/products/:id", isAdmin, async (req, res) => {
  const { id } = req.params;
  const { name, description, price,image, stock } = req.body;
  try {
    const [result] = await db.query(
      "UPDATE products SET name = ?, description = ?, price = ?,image= ? ,stock = ? WHERE id = ?",
      [name, description, price,image, stock, id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).send("Ürün bulunamadı veya güncellenemedi");
    }
    res.redirect("/admin/products");
  } catch (err) {
    res.status(500).send("Ürün güncellenemedi");
  }
});

module.exports = router;
