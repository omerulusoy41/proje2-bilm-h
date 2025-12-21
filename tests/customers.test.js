const request = require('supertest');
const app = require('../src/app');
const { sequelize, Customer } = require('../src/models');

describe('Customers API', () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true }); // DB tablolarını sıfırla
  });

  beforeEach(async () => {
    await Customer.destroy({ where: {} }); // test başına temiz DB
  });

  test('GET /api/customers initially returns empty array', async () => {
    const res = await request(app).get('/api/customers');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual([]);
  });

  test('POST /api/customers creates customer', async () => {
    const payload = { firstName: 'Test', lastName: 'User', phone: '05321234567', email: 'test@example.com' };
    const res = await request(app).post('/api/customers').send(payload);
    expect(res.statusCode).toBe(201);
    expect(res.body.id).toBeDefined();
  });

  test('GET /api/customers returns created customer', async () => {
    const payload = { firstName: 'John', lastName: 'Doe', phone: '05321234567', email: 'john@example.com' };
    await Customer.create(payload);

    const res = await request(app).get('/api/customers');
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].firstName).toBe('John');
  });
});
