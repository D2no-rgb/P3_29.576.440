//framework Express.
const express = require('express');
const app = express();

const authRoutes = require('./routes/authRoutes');

const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API de Información',
      version: '1.0.0',
      description: 'API REST',
    },
    servers: [
      {
        url: 'http://localhost:3000', 
        description: 'Servidor de Desarrollo'
      },
    ],
  },

  apis: ['./app.js'], //documentación 
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));


const sequelize = require('./config/database');
const User = require('./models/User'); 
const userRoutes = require('./routes/userRoutes');

// Sincronizar los modelos con la base de datos
sequelize.sync({ force: false })
  .then(() => {
    console.log('Base de datos y modelos sincronizados.');
  })
  .catch(err => {
    console.error(' Error al sincronizar la base de datos:', err);
  });

//----------


app.use(express.json());

// Definición de la ruta base para /auth
app.use('/auth', authRoutes); 
app.use('/users', userRoutes);

// Configuración del endpoint GET /about
app.get('/about', (req, res) => {
  const miInformacion = {
    nombreCompleto: "Daniel Moreno", 
    cedula: "29.576.440", 
    seccion: "Sección 1" 
  };

  // Respuesta JSend de éxito
  res.status(200).json({
    status: "success",
    data: miInformacion
  });
});


// Configuración del endpoint GET /ping
app.get('/ping', (req, res) => {
  res.status(200).send(''); 
});

module.exports = app;