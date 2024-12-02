const { Sequelize } = require('sequelize');

// Configura la conexión a PostgreSQL
const sequelize = new Sequelize(
    'auth',  // Nombre de la base de datos
    'postgres', // Usuario
    'veronica',  // Contraseña del usuario 'postgres'
    {
        host: 'localhost', // El servidor de la base de datos
        dialect: 'postgres', // El dialecto de la base de datos (PostgreSQL)
    }
);

module.exports = { sequelize };
