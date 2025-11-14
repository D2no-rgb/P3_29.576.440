const { Sequelize } = require('sequelize');
const path = require('path');

// Crea una instancia de Sequelize.
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '..', 'db.sqlite'), // Guarda el archivo en la raíz del proyecto
  logging: false, // Desactiva el logging de SQL en consola (opcional)
});

// Exporta la instancia para usarla en los modelos y en el archivo principal
module.exports = sequelize;