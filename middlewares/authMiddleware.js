const jwt = require('jsonwebtoken');

exports.isAuthenticated = (req, res, next) => {
  const token = req.cookies.jwt;
  if (!token) {
    req.flash("error", "Por favor, inicia sesión primero para acceder a esta página.");
    return res.redirect("/auth/login");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Adjunto los datos del usuario
    console.log(req.user); // Verifica el contenido del token
    next();
  } catch (err) {
    res.clearCookie("jwt");
    req.flash("error", "Sesión inválida o expirada.");
    res.redirect("/auth/login");
  }
};
