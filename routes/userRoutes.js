// routes/userRoutes.js
const express = require("express");
const { getAllUsers, deleteUser } = require("../controllers/userController");
const { isAuthenticated } = require("../middlewares/authMiddleware");
const { isAdmin } = require("../middlewares/roleMiddleware");
const router = express.Router();

// Ruta para obtener todos los usuarios (solo admin)
router.get("/", isAuthenticated, isAdmin, getAllUsers); 

// Ruta para eliminar un usuario (solo admin)
router.delete("/:id", isAuthenticated, isAdmin, deleteUser); 

module.exports = router;
