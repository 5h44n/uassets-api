require('dotenv').config();
const request = require('supertest');
const app = require('../../server');
const { sequelize } = require('../../config/database');
const { User, Tenant } = require('../../models');

let tenant;

beforeAll(async () => {
  // Sync database
  await sequelize.sync({ force: true });

  // Create a test tenant
  tenant = await Tenant.create({
    name: 'Test Tenant',
    apiKey: 'test-api-key',
    apiSecret: 'test-api-secret',
  });
});

afterAll(async () => {
  await sequelize.close();
});

describe('User Controller', () => {
  let userId;

  beforeEach(async () => {
    // Create a user for testing scoped to the test tenant
    const user = await User.create({
      tenantId: tenant.id,
      walletAddress: '0x123',
    });
    userId = user.id;
  });

  afterEach(async () => {
    // Clear users after each test
    await User.destroy({ where: {} });
  });

  describe('POST /api/users', () => {
    it('should create a new user successfully', async () => {
      const response = await request(app)
        .post('/api/users')
        .set('x-api-key', tenant.apiKey)
        .set('x-api-secret', tenant.apiSecret)
        .send({ walletAddress: '0xABC' });

      expect(response.statusCode).toBe(201);
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('walletAddress', '0xABC');
    });

    it('should not create a user with an existing wallet address', async () => {
      const response = await request(app)
        .post('/api/users')
        .set('x-api-key', tenant.apiKey)
        .set('x-api-secret', tenant.apiSecret)
        .send({ walletAddress: '0x123' }); // Already created in beforeEach

      expect(response.statusCode).toBe(400);
      expect(response.body).toEqual({
        message: 'Wallet address already in use',
      });
    });

    it('should not create a user without a walletAddress', async () => {
      const response = await request(app)
        .post('/api/users')
        .set('x-api-key', tenant.apiKey)
        .set('x-api-secret', tenant.apiSecret)
        .send({});

      expect(response.statusCode).toBe(400);
      expect(response.body).toEqual({ message: 'Wallet address is required' });
    });
  });

  describe('GET /api/users/:id', () => {
    it('should get the user successfully', async () => {
      const response = await request(app)
        .get(`/api/users/${userId}`)
        .set('x-api-key', tenant.apiKey)
        .set('x-api-secret', tenant.apiSecret);

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('id', userId);
      expect(response.body).toHaveProperty('walletAddress', '0x123');
    });

    it('should return 404 for invalid user id', async () => {
      const response = await request(app)
        .get('/api/users/invalid-id')
        .set('x-api-key', tenant.apiKey)
        .set('x-api-secret', tenant.apiSecret);

      expect(response.statusCode).toBe(404);
      expect(response.body).toEqual({ message: 'User not found' });
    });
  });

  describe('PUT /api/users/:id', () => {
    it('should update the user successfully', async () => {
      const response = await request(app)
        .put(`/api/users/${userId}`)
        .set('x-api-key', tenant.apiKey)
        .set('x-api-secret', tenant.apiSecret)
        .send({ walletAddress: '0x456' });

      expect(response.statusCode).toBe(200);
      expect(response.body.user).toHaveProperty('walletAddress', '0x456');
    });

    it('should return 404 when updating non-existent user', async () => {
      const response = await request(app)
        .put('/api/users/invalid-id')
        .set('x-api-key', tenant.apiKey)
        .set('x-api-secret', tenant.apiSecret)
        .send({ walletAddress: '0x789' });

      expect(response.statusCode).toBe(404);
      expect(response.body).toEqual({ message: 'User not found' });
    });

    it('should return 400 when updating to an existing wallet address', async () => {
      await User.create({ walletAddress: '0x789', tenantId: tenant.id });

      const response = await request(app)
        .put(`/api/users/${userId}`)
        .set('x-api-key', tenant.apiKey)
        .set('x-api-secret', tenant.apiSecret)
        .send({ walletAddress: '0x789' });

      expect(response.statusCode).toBe(400);
      expect(response.body).toEqual({
        message: 'Wallet address already in use',
      });
    });

    it('should return 400 when walletAddress is not provided', async () => {
      const response = await request(app)
        .put(`/api/users/${userId}`)
        .set('x-api-key', tenant.apiKey)
        .set('x-api-secret', tenant.apiSecret)
        .send({});

      expect(response.statusCode).toBe(400);
      expect(response.body).toEqual({ message: 'Wallet address is required' });
    });
  });
});
