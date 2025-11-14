// server.js
const app = require('./app'); // Importa la aplicación Express
const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
  console.log(`🚀 Servidor Express iniciado en el puerto ${port}`);
  console.log(`Documentación de Swagger disponible en http://localhost:${port}/api-docs`);
});

// Manejo básico de errores de servidor
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Puerto ${port} ya está en uso. Intente con otro.`);
  } else {
    throw error;
  }
});