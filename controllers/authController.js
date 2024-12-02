const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const { body, validationResult } = require("express-validator");

const MAX_ATTEMPTS = 5; // Máximo número de intentos fallidos
const LOCK_TIME = 30 * 60 * 1000; // Tiempo de bloqueo en milisegundos (30 minutos)

exports.register = [
  body("email").isEmail().withMessage("Correo inválido").normalizeEmail(),
  body("password").isLength({ min: 6 }).withMessage("Contraseña débil").trim().escape(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      req.flash("error", errors.array().map((err) => err.msg).join(", "));
      return res.redirect("/auth/register");
    }

    const { email, password, role } = req.body;
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      await User.create({ email, password: hashedPassword, role });
      req.flash("success", "Registro exitoso. Por favor, inicia sesión.");
      res.redirect("/auth/login"); // Cambiado a login
    } catch (err) {
      console.error(err);
      req.flash("error", "Error al registrar usuario.");
      res.redirect("/auth/register");
    }
  },
];


exports.login = [
  // Validación y sanitización de campos
  body("email").isEmail().withMessage("Correo inválido").normalizeEmail(),
  body("password").notEmpty().withMessage("Contraseña obligatoria").trim().escape(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      req.flash("error", errors.array().map((err) => err.msg).join(", "));
      return res.redirect("/auth/login");
    }

    const { email, password, remember } = req.body;

    try {
      const user = await User.findOne({ where: { email } });

      // Si el usuario no existe
      if (!user) {
        req.flash("error", "El correo no está registrado.");
        return res.redirect("/auth/login");
      }

      // Verificar si la cuenta está bloqueada
      if (user.lock_until && new Date() < new Date(user.lock_until)) {
        const timeRemaining = (new Date(user.lock_until) - new Date()) / 1000; // Tiempo restante en segundos
        req.flash("error", `Cuenta bloqueada. Intenta de nuevo en ${Math.ceil(timeRemaining)} segundos.`);
        return res.redirect("/auth/login");
      }

      // Verificar la contraseña
      if (!(await bcrypt.compare(password, user.password))) {
        // Incrementar los intentos fallidos
        user.failed_attempts += 1;

        if (user.failed_attempts >= MAX_ATTEMPTS) {
          // Bloquear temporalmente la cuenta
          user.lock_until = new Date(new Date().getTime() + LOCK_TIME);
        }

        await user.save();

        req.flash("error", "Credenciales incorrectas.");
        return res.redirect("/auth/login");
      }

      // Si el inicio de sesión es exitoso, restablecer los intentos fallidos
      user.failed_attempts = 0;
      user.lock_until = null; // Eliminar el bloqueo
      await user.save();

      // Generar el token
      const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
        expiresIn: remember ? "7d" : "1h",
      });

      // Configurar la cookie con flags httpOnly, secure y sameSite
      const cookieOptions = {
        httpOnly: true,  // Impide el acceso a la cookie desde JavaScript
        secure: process.env.NODE_ENV === "production", // Solo se enviará por HTTPS en producción
        maxAge: remember ? 7 * 24 * 60 * 60 * 1000 : 60 * 60 * 1000, // Tiempo de expiración de la cookie (1h o 7d)
        sameSite: "Strict", // Evita que la cookie se envíe en solicitudes entre sitios
      };

      res.cookie("jwt", token, cookieOptions); // Crear la cookie JWT con las opciones configuradas

      res.redirect("/dashboard");
    } catch (err) {
      console.error(err);
      req.flash("error", "Ocurrió un error al iniciar sesión.");
      res.redirect("/auth/login");
    }
  },
];
