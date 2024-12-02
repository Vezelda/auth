const express = require("express");
const { register, login } = require("../controllers/authController");
const router = express.Router();

router.get("/register", (req, res) => res.render("auth/register"));
router.post("/register", register);

router.get('/login', (req, res) => {
    const messages = req.flash(); // Recuperar los mensajes flash
    res.render('auth/login', { messages }); // Pasar los mensajes a la vista
});
router.post("/login", login);

module.exports = router;
