const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // Importa la conexión

const User = sequelize.define('User', {
  // 1. Identificador Único (automático)
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  // 2. Nombre Completo
  nombreCompleto: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  // 3. Correo Electrónico Único
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true, 
  },
  // 4. Credenciales de Acceso (Hash de la contraseña)
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  }
}, {
  // Opciones del modelo
  tableName: 'users',
  timestamps: true,
});

module.exports = User;