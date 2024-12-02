const express = require("express");
const session = require("express-session");
const flash = require("connect-flash");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const methodOverride = require("method-override");
const csrf = require("csurf");
const expressSanitizer = require("express-sanitizer");
const { sequelize } = require("./config/db");

// Cargar variables de entorno
dotenv.config();

const app = express();

// Configuración de vistas y EJS
app.set("view engine", "ejs");
app.set("views", "./views");

// Middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(expressSanitizer()); // Mantener el sanitizer para limpiar entradas
app.use(methodOverride("_method"));
app.use(cookieParser());

// Configuración de sesiones
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // Cambiar a true si usas HTTPS
  })
);
app.use(flash());

// Configuración de protección CSRF
const csrfProtection = csrf({ cookie: true });
app.use(csrfProtection);

// Middleware para mensajes flash y token CSRF en vistas
app.use((req, res, next) => {
  res.locals.messages = req.flash();
  res.locals.csrfToken = req.csrfToken(); // Generar token CSRF
  next();
});

// Sincronizar la base de datos
sequelize.sync({ force: true }) // Este parámetro elimina y vuelve a crear las tablas
  .then(() => {
    console.log('Base de datos sincronizada');
  })
  .catch((error) => {
    console.error('Error al sincronizar la base de datos:', error);
  });

// Importar rutas
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");

// Usar rutas
app.use("/auth", authRoutes);
app.use("/users", userRoutes);

// Manejo de errores CSRF
app.use((err, req, res, next) => {
  if (err.code === "EBADCSRFTOKEN") {
    req.flash("error", "Solicitud no válida o sesión expirada.");
    return res.redirect("/auth/login");
  }
  next(err);
});

// Servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
