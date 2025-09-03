const express = require('express');
const router = express.Router();
require("dotenv").config();
const bcrypt = require("bcryptjs");
const db = require("../config/db");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/login", (req, res) => {
  res.render("login");
});

router.get("/register", (req, res) => {
  res.render("register",);
});

router.get('/dashboard', authMiddleware, (req, res) => {
  res.render("dashboard", { user: req.session.user });
});

router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const [existingUser] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    if (existingUser.length > 0) {
      return res.status(400).json({ message: "Bu e-posta zaten kayıtlı!!!!!" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.query("INSERT INTO users (name, email, password) VALUES (?, ?, ?)", [
      name,
      email,
      hashedPassword,
    ]);

    return res.status(201).json({ message: "Kayıt başarılı !! giriş yapabilirsiniz." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Kayıt sırasında bir hata oluştu." });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [email]);

    if (rows.length === 0) {
      return res.render("login", { error: "Kullanıcı bulunamadı." });
    }

    const user = rows[0];
    const kontrol_password = await bcrypt.compare(password, user.password);

    if (!kontrol_password) {
      return res.render("login", { error: "Şifreniz yanlış." });
    }

    req.session.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    };

    res.redirect("/anasayfa"); 
  } catch (error) {
    res.render("login", { error: "Sunucu bağlantı hatası." });
  }
});

router.post("/logout", (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).send("Çıkış yapılamadı");
    res.clearCookie("connect.sid");
    res.redirect("/login");
  });
});

module.exports = router;
