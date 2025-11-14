const jwt = require('jsonwebtoken');
require('dotenv').config(); // Cargar variables de entorno.

// Función para generar el token JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

// Middleware para proteger rutas (verificando el token)
const protect = (req, res, next) => {
  let token;

  // 1. Verificar si hay un token en el header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // 2. Extraer el token (quitando 'Bearer ')
      token = req.headers.authorization.split(' ')[1];

      // 3. Verificar y decodificar el token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 4. Pasar el ID del usuario al request para usarlo en el controlador
      req.userId = decoded.id; 
      next();
    } catch (error) {
      // Si el token no es válido (expirado, incorrecto, etc.)
      res.status(401).json({ status: "fail", data: { message: "Acceso no autorizado, token fallido o expirado." } });
    }
  }

  if (!token) {
    // Si no hay token en el header
    res.status(401).json({ status: "fail", data: { message: "Acceso no autorizado, no se proporcionó token." } });
  }
};

module.exports = { generateToken, protect };