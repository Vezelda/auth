const sanitizeInput = (req, res, next) => {
    const sanitize = (value) =>
      typeof value === "string" ? value.replace(/<[^>]*>?/gm, "") : value;
  
    req.body = Object.fromEntries(
      Object.entries(req.body).map(([key, value]) => [key, sanitize(value)])
    );
  
    req.query = Object.fromEntries(
      Object.entries(req.query).map(([key, value]) => [key, sanitize(value)])
    );
  
    req.params = Object.fromEntries(
      Object.entries(req.params).map(([key, value]) => [key, sanitize(value)])
    );
  
    next();
  };
  
  module.exports = sanitizeInput; // Asegúrate de exportarlo correctamente
  