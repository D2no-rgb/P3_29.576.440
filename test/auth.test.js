const request = require('supertest');
const app = require('../app'); 
const sequelize = require('../config/database');
const User = require('../models/User');


// Variables globales para las pruebas
let testUser = {
    nombreCompleto: 'Prueba Automática',
    email: 'test-auto@example.com',
    password: 'PasswordSeguro123'
};
let authToken = '';

// --- Para la Base de Datos ---

beforeAll(async () => {
    // 1. Conexión abierta y sincronizada
    await sequelize.sync({ force: true }); 

    // 2. Limpiar la tabla de usuarios (Debe ser la siguiente línea)
    await User.destroy({ where: {} });
});

afterAll(async () => {
    // Cierra la conexión de la DB para que Jest termine correctamente
    await sequelize.close(); 
});


describe('Suite de Autenticación y Seguridad', () => {
    
    // ------------------------------------
    // 1. PRUEBAS DE REGISTRO (POST /users)
    // ------------------------------------
    
    test('POST /users (Registro) - Debe crear un nuevo usuario y responder 201', async () => {
        const response = await request(app)
            .post('/users')
            .send(testUser);

        expect(response.statusCode).toBe(201);
        expect(response.body.status).toBe('success');
        expect(response.body.data).toHaveProperty('id');
        expect(response.body.data).not.toHaveProperty('password'); // Nunca exponer el hash
        testUser.id = response.body.data.id; // Guarda el ID
    });

    test('POST /users (Registro) - Debe fallar con 409 si el email ya existe (email duplicado)', async () => {
        const response = await request(app)
            .post('/users')
            .send(testUser); // Mismo email

        expect(response.statusCode).toBe(409);
        expect(response.body.status).toBe('fail');
        expect(response.body.data.message).toContain('El correo electrónico ya está registrado.');
    });


    // ------------------------------------
    // 2. PRUEBAS DE LOGIN (POST /auth/login)
    // ------------------------------------

    test('POST /auth/login - Debe iniciar sesión y retornar un token JWT (200 OK)', async () => {
        const response = await request(app)
            .post('/auth/login')
            .send({ email: testUser.email, password: testUser.password });

        expect(response.statusCode).toBe(200);
        expect(response.body.status).toBe('success');
        expect(response.body.data).toHaveProperty('token');
        authToken = response.body.data.token; // ¡Guardamos el token para rutas protegidas!
    });

    test('POST /auth/login - Debe fallar con 401 para credenciales incorrectas', async () => {
        const response = await request(app)
            .post('/auth/login')
            .send({ email: testUser.email, password: 'wrongPassword' });

        expect(response.statusCode).toBe(401);
        expect(response.body.status).toBe('fail');
        expect(response.body.data.message).toContain('Credenciales de acceso inválidas.');
    });


    // ------------------------------------
    // 3. PRUEBAS DE SEGURIDAD (RUTAS PROTEGIDAS)
    // ------------------------------------

    test('GET /users - Debe fallar con 401 Unauthorized si no hay token', async () => {
        const response = await request(app)
            .get('/users');

        expect(response.statusCode).toBe(401);
        expect(response.body.status).toBe('fail');
    });

    test('GET /users - Debe retornar datos (200 OK) con token válido', async () => {
        const response = await request(app)
            .get('/users')
            .set('Authorization', `Bearer ${authToken}`); // token guardado

        expect(response.statusCode).toBe(200);
        expect(response.body.status).toBe('success');
        expect(response.body.data.length).toBeGreaterThan(0);
    });

    // ------------------------------------
    // 4. PRUEBAS CRUD CON AUTORIZACIÓN
    // ------------------------------------
    
    test('DELETE /users/:id - Debe eliminar un usuario (200 OK) con token', async () => {
        const response = await request(app)
            .delete(`/users/${testUser.id}`)
            .set('Authorization', `Bearer ${authToken}`);

        expect(response.statusCode).toBe(200);
        expect(response.body.status).toBe('success');
    });
});