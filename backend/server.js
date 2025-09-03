const express = require("express")
const app = express()
const connect = require("../backend/config/db")
const db = require("../backend/config/db") 
require('dotenv').config()
const path = require("path")
const productRoute = require("../backend/routes/product")
const cartRoute = require("../backend/routes/cart")
const session = require("express-session");
const authMiddleware = require("../backend/middleware/authMiddleware")
const adminRoute = require("../backend/routes/admin")
const userRoute = require("../backend/routes/auth")
const cors = require("cors");
const methodOverride = require("method-override");

app.set('view engine', 'ejs');  
app.use(methodOverride("_method"));
app.use(cors());

app.use(session({
  secret: process.env.SECRET_KEY,  
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 // 1 gün
  }
}));
const port = process.env.PORT || 3000;
app.use(express.urlencoded({ extended: true })); 
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'backend', 'public')));
app.set('views', path.join(__dirname, '..', 'backend', 'views'));

app.use("/product", productRoute)
app.use("/cart", cartRoute);
app.use("/auth", userRoute)
app.use("/admin", adminRoute)

app.get("/profil", authMiddleware, (req, res) => {
  res.json({ userId: req.session.userId, userName: req.session.userName });
});

app.get("/register", (req, res) => {
  res.render("register")
})

app.get("/login", (req, res) => {
  res.render("login")
})

app.get("/sepet", (req, res) => {
  if (!req.session.user) {
    return res.redirect("/login"); 
  }
  res.render("sepet")
})

app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).send("Çıkış işlemi başarısız oldu.");
    res.redirect("/login");
  });
});

app.get("/anasayfa", async (req, res) => {
  if (!req.session.user) {
    return res.redirect("/login");
  }

  try {
    const [products] = await db.query("SELECT * FROM products");
    res.render("index", { products }); 
  } catch (error) {
    console.error("Ürünler çekilirken hata oldu", error);
    res.status(500).send("Sunucu hatası");
  }
});

app.get("/", (req, res) => {
res.end("ana sayfa /login yaz sonra giriş yap")
});

app.listen(port, (error) => {
  if (error) {
    console.log("sunucuya bağlanırken hata oluştu\n", error)
  }
})
