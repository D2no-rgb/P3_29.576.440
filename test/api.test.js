const request = require('supertest');
const app = require('../app'); 

describe('API Endpoints Status Check', () => {

  // Para el endpoint GET /ping
  test('GET /ping should respond with 200 OK', async () => {
    const response = await request(app).get('/ping');
    
    // Verifica que el código de estado sea 200
    expect(response.statusCode).toBe(200);
    // Opcionalmente, verifica que el cuerpo esté vacío
    expect(response.text).toBe('');
  });

  // Prueba para el endpoint GET /about
  test('GET /about should respond with 200 OK and valid JSend structure', async () => {
    const response = await request(app).get('/about');
    
    // Verifica que el código de estado sea 200
    expect(response.statusCode).toBe(200);
    
    // Verifica que el cuerpo sea un JSON
    expect(response.headers['content-type']).toMatch(/json/);
    
    // Verifica la estructura JSend y los campos requeridos
    const data = response.body;
    expect(data.status).toBe('success');
    expect(data.data).toBeDefined();
    expect(data.data.nombreCompleto).toBeDefined();
    expect(data.data.cedula).toBeDefined();
    expect(data.data.seccion).toBeDefined();
  });
});