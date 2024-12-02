const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const User = sequelize.define("User", {
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.STRING,
    defaultValue: "Usuario",
  },
  failed_attempts: { // Nuevo campo
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  lock_until: { // Nuevo campo
    type: DataTypes.DATE,
    allowNull: true,
  },
});

module.exports = User;
