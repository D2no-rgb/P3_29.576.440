const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User'); // Modelo de usuario
const { protect } = require('../middleware/authMiddleware'); 

// --- Funciones de Utilidad (JSend Response) ---
const sendSuccess = (res, data, statusCode = 200) => {
    res.status(statusCode).json({ status: "success", data });
};

const sendFail = (res, message, statusCode = 400) => {
    res.status(statusCode).json({ status: "fail", data: { message } });
};

const sendError = (res, message = "Internal Server Error", statusCode = 500) => {
    res.status(statusCode).json({ status: "error", message });
};


// --- Middleware de Protección (Placeholder) ---

const protectPlaceholder = (req, res, next) => {

    next(); 
};


// --- Rutas CRUD ---

// Crear Usuario (Registro)

router.post('/', async (req, res) => {
    const { nombreCompleto, email, password } = req.body;

    // 1. Validar campos requeridos
    if (!nombreCompleto || !email || !password) {
        return sendFail(res, "Faltan campos requeridos: nombreCompleto, email, y password.", 400);
    }
    
    try {
        // 2. Verificar si el email ya existe (email debe ser único)
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return sendFail(res, "El correo electrónico ya está registrado.", 409); // 409 Conflict
        }

        // 3. Crear Hash de la Contraseña (Requerimiento de seguridad)
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 4. Crear el usuario en la DB
        const newUser = await User.create({
            nombreCompleto,
            email,
            password: hashedPassword // Almacena el hash, NO la contraseña plana
        });

        // 5. Responder con el nuevo usuario (sin la contraseña)
        sendSuccess(res, {
            id: newUser.id,
            nombreCompleto: newUser.nombreCompleto,
            email: newUser.email,
            createdAt: newUser.createdAt
        }, 201);

    } catch (error) {
        console.error('Error al crear usuario:', error);
        sendError(res, 'Error en el servidor al crear el usuario.');
    }
});


// GET /users: Leer Todos los Usuarios (PROTEGIDA)
router.get('/', protectPlaceholder, async (req, res) => {
    try {
        const users = await User.findAll({
            // Excluir la contraseña y otros campos sensibles
            attributes: ['id', 'nombreCompleto', 'email', 'createdAt', 'updatedAt']
        });
        sendSuccess(res, users);
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        sendError(res, 'Error en el servidor al obtener la lista de usuarios.');
    }
});


// GET /users/:id: Leer un Usuario por ID (PROTEGIDA)
router.get('/:id', protectPlaceholder, async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id, {
            attributes: ['id', 'nombreCompleto', 'email', 'createdAt', 'updatedAt']
        });
        
        if (!user) {
            return sendFail(res, `Usuario con ID ${req.params.id} no encontrado.`, 404); // 404 Not Found (No Funca)
        }
        
        sendSuccess(res, user);
    } catch (error) {
        console.error('Error al obtener usuario por ID:', error);
        sendError(res, 'Error en el servidor al obtener el usuario.');
    }
});


// PUT /users/:id: Actualizar Usuario (PROTEGIDA)
router.put('/:id', protectPlaceholder, async (req, res) => {
    const { nombreCompleto, email, password } = req.body;
    const userId = req.params.id;

    // 1. Buscar el usuario
    const user = await User.findByPk(userId);
    if (!user) {
        return sendFail(res, `Usuario con ID ${userId} no encontrado.`, 404);
    }

    try {
        // 2. Preparar los campos a actualizar
        const updateFields = { nombreCompleto, email };
        
        // 3. Si se proporciona una nueva contraseña, crear hash
        if (password) {
            const salt = await bcrypt.genSalt(10);
            updateFields.password = await bcrypt.hash(password, salt);
        }

        // 4. Actualizar en la DB
        const [updatedRows] = await User.update(updateFields, {
            where: { id: userId }
        });

        // 5. Responder
        if (updatedRows > 0) {
            const updatedUser = await User.findByPk(userId, {
                attributes: ['id', 'nombreCompleto', 'email', 'createdAt', 'updatedAt']
            });
            sendSuccess(res, updatedUser);
        } else {
            sendFail(res, "No se realizó ninguna actualización o el usuario no existe.", 400);
        }

    } catch (error) {
        // 409 Conflict si el nuevo email ya existe
        if (error.name === 'SequelizeUniqueConstraintError') {
            return sendFail(res, "El nuevo correo electrónico ya está registrado por otro usuario.", 409);
        }
        console.error('Error al actualizar usuario:', error);
        sendError(res, 'Error en el servidor al actualizar el usuario.');
    }
});


// DELETE /users/:id: Eliminar Usuario (PROTEGIDA)
router.delete('/:id', protectPlaceholder, async (req, res) => {
    try {
        const deletedRows = await User.destroy({
            where: { id: req.params.id }
        });

        if (deletedRows > 0) {
            sendSuccess(res, { message: `Usuario con ID ${req.params.id} eliminado exitosamente.` });
        } else {
            sendFail(res, `Usuario con ID ${req.params.id} no encontrado.`, 404);
        }
    } catch (error) {
        console.error('Error al eliminar usuario:', error);
        sendError(res, 'Error en el servidor al eliminar el usuario.');
    }
});


module.exports = router;