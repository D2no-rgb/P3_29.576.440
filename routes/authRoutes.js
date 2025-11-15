const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { generateToken } = require('../middleware/authMiddleware');
const { sendSuccess, sendFail, sendError } = require('../utils/jsend'); // Archivo de utilidades JSend

//Recordatorio para mi, El registro (POST /users) ya está implementado en userRoutes.js

// POST /auth/login: Iniciar Sesión y Emitir Token... espero que funcione.


/**
 * @swagger
 * components:
 * securitySchemes:
 * bearerAuth:
 * type: http
 * scheme: bearer
 * bearerFormat: JWT
 * schemas:
 * UserCredentials:
 * type: object
 * required:
 * - email
 * - password
 * properties:
 * email:
 * type: string
 * format: email
 * description: Correo electrónico del usuario.
 * password:
 * type: string
 * format: password
 * description: Contraseña.
 *
 * /auth/login:
 * post:
 * summary: Iniciar sesión y obtener un token JWT
 * tags: [Autenticación]
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/UserCredentials'
 * responses:
 * 200:
 * description: Inicio de sesión exitoso. Retorna el JWT.
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * status: { type: string, example: success }
 * data:
 * type: object
 * properties:
 * token: { type: string, description: El token JWT para autorizar futuras peticiones. }
 * 401:
 * description: Credenciales inválidas.
 */


router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return sendFail(res, "Debe proporcionar correo y contraseña.", 400);
    }
    
    try {
        // 1. Buscar el usuario por email
        const user = await User.findOne({ where: { email } });

        // 2. Verificar existencia y contraseña
        if (user && (await bcrypt.compare(password, user.password))) {
            // 3. Credenciales correctas: Generar y devolver el token
            const token = generateToken(user.id);

            sendSuccess(res, {
                token: token,
                id: user.id,
                nombreCompleto: user.nombreCompleto,
                email: user.email
            });
        } else {
            // 4. Credenciales incorrectas
            sendFail(res, "Credenciales de acceso inválidas.", 401); // 401 Unauthorized (No Autorizado.)
        }

    } catch (error) {
        console.error('Error durante el inicio de sesión:', error);
        sendError(res, 'Error en el servidor durante el inicio de sesión.');
    }
});

module.exports = router;