const request = require('supertest');
const app = require('../src/app');
const { sequelize, Customer } = require('../src/models');

describe('Customers API', () => {

  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  beforeEach(async () => {
    await Customer.destroy({ where: {} });
  });

  /* ---------------- GET ALL ---------------- */

  test('GET /api/customers initially returns empty array', async () => {
    const res = await request(app).get('/api/customers');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual([]);
  });

  /* ---------------- CREATE ---------------- */

  test('POST /api/customers creates customer', async () => {
    const payload = {
      firstName: 'Test',
      lastName: 'User',
      phone: '05321234567',
      email: 'test@example.com'
    };

    const res = await request(app)
      .post('/api/customers')
      .send(payload);

    expect(res.statusCode).toBe(201);
    expect(res.body.id).toBeDefined();
    expect(res.body.firstName).toBe('Test');
  });

  /* ---------------- GET ALL AFTER CREATE ---------------- */

  test('GET /api/customers returns created customer', async () => {
    await Customer.create({
      firstName: 'John',
      lastName: 'Doe',
      phone: '05321234567',
      email: 'john@example.com'
    });

    const res = await request(app).get('/api/customers');

    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].firstName).toBe('John');
  });

  /* ---------------- GET BY ID ---------------- */

  test('GET /api/customers/:id returns customer', async () => {
    const customer = await Customer.create({
      firstName: 'Ali',
      lastName: 'Veli',
      phone: '05321234567',
      email: 'ali@example.com'
    });

    const res = await request(app)
      .get(`/api/customers/${customer.id}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.firstName).toBe('Ali');
  });

  test('GET /api/customers/:id returns 404 if not found', async () => {
    const res = await request(app)
      .get('/api/customers/9999');

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe('Customer not found');
  });

  /* ---------------- UPDATE ---------------- */

  test('PUT /api/customers/:id updates customer', async () => {
    const customer = await Customer.create({
      firstName: 'Old',
      lastName: 'Name',
      phone: '05321234567',
      email: 'old@example.com'
    });

    const res = await request(app)
      .put(`/api/customers/${customer.id}`)
      .send({ firstName: 'New' });

    expect(res.statusCode).toBe(200);
    expect(res.body.firstName).toBe('New');
  });

  test('PUT /api/customers/:id returns 404 if not found', async () => {
    const res = await request(app)
      .put('/api/customers/9999')
      .send({ firstName: 'X' });

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe('Customer not found');
  });

  /* ---------------- DELETE ---------------- */

  test('DELETE /api/customers/:id deletes customer', async () => {
    const customer = await Customer.create({
      firstName: 'Delete',
      lastName: 'Me',
      phone: '05321234567',
      email: 'delete@example.com'
    });

    const res = await request(app)
      .delete(`/api/customers/${customer.id}`);

    expect(res.statusCode).toBe(204);

    const deleted = await Customer.findByPk(customer.id);
    expect(deleted).toBeNull();
  });

  test('DELETE /api/customers/:id returns 404 if not found', async () => {
    const res = await request(app)
      .delete('/api/customers/9999');

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe('Customer not found');
  });

});
