const User = require("../models/user");

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll();
    res.render("users/list", { 
      users,
      messages: { 
        success: req.flash("success"), 
        error: req.flash("error") 
      } 
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error al obtener los usuarios.");
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    await User.destroy({ where: { id } });
    req.flash("success", "Usuario eliminado correctamente.");
    res.redirect("/users");
  } catch (err) {
    console.error(err);
    req.flash("error", "Error al eliminar el usuario.");
    res.redirect("/users");
  }
};
