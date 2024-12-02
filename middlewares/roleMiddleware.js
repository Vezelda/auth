exports.isAdmin = (req, res, next) => {
  console.log("Rol del usuario:", req.user.role); // Verifica el rol
  if (req.user && req.user.role === "Administrador") {
    return next();
  }
  req.flash("error", "Acceso denegado.");
  return res.redirect("/dashboard"); // Redirigir al dashboard si no es admin
};
