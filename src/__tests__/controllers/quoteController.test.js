const request = require('supertest');
const app = require('../../server');
const { sequelize } = require('../../config/database');
const { User, Quote, Tenant } = require('../../models');

let tenant;

beforeAll(async () => {
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

describe('Quote Controller', () => {
  let user;

  beforeEach(async () => {
    user = await User.create({
      tenantId: tenant.id,
      walletAddress: '0xf0b0Db37E6e0015360093aE564F7745549d8E635',
    });
  });

  afterEach(async () => {
    await Quote.destroy({ where: {} });
    await User.destroy({ where: {} });
  });

  describe('POST /api/quote', () => {
    it('should return 400 if required fields are missing', async () => {
      const response = await request(app)
        .post('/api/quote')
        .set('x-api-key', tenant.apiKey)
        .set('x-api-secret', tenant.apiSecret)
        .send({
          userId: user.id,
          type: 'BUY',
          // Missing token and pairToken
        });

      expect(response.statusCode).toBe(400);
      expect(response.body).toEqual({ message: 'Missing required fields' });
    });

    it('should return 400 if userId is invalid', async () => {
      const response = await request(app)
        .post('/api/quote')
        .set('x-api-key', tenant.apiKey)
        .set('x-api-secret', tenant.apiSecret)
        .send({
          userId: 'invalid-user-id',
          type: 'BUY',
          token: 'BTC',
          pairToken: 'USDC',
          pairTokenAmount: 10,
        });

      expect(response.statusCode).toBe(400);
      expect(response.body).toEqual({ message: 'Invalid userId' });
    });

    it('should return 400 if type is invalid', async () => {
      const response = await request(app)
        .post('/api/quote')
        .set('x-api-key', tenant.apiKey)
        .set('x-api-secret', tenant.apiSecret)
        .send({
          userId: user.id,
          type: 'INVALID_TYPE',
          token: 'BTC',
          pairToken: 'USDC',
          pairTokenAmount: 10,
        });

      expect(response.statusCode).toBe(400);
      expect(response.body).toEqual({ message: 'Invalid type' });
    });

    it('should return 400 if tokenAmount is missing or invalid for SELL orders', async () => {
      let response = await request(app)
        .post('/api/quote')
        .set('x-api-key', tenant.apiKey)
        .set('x-api-secret', tenant.apiSecret)
        .send({
          userId: user.id,
          type: 'SELL',
          token: 'BTC',
          pairToken: 'USDC',
          // tokenAmount is missing
        });

      expect(response.statusCode).toBe(400);
      expect(response.body).toEqual({
        message: 'tokenAmount must be greater than zero for SELL orders',
      });

      // tokenAmount is zero
      response = await request(app)
        .post('/api/quote')
        .set('x-api-key', tenant.apiKey)
        .set('x-api-secret', tenant.apiSecret)
        .send({
          userId: user.id,
          type: 'SELL',
          token: 'BTC',
          pairToken: 'USDC',
          tokenAmount: 0,
        });

      expect(response.statusCode).toBe(400);
      expect(response.body).toEqual({
        message: 'tokenAmount must be greater than zero for SELL orders',
      });
    });

    it('should return 400 if pairTokenAmount is missing or invalid for BUY orders', async () => {
      let response = await request(app)
        .post('/api/quote')
        .set('x-api-key', tenant.apiKey)
        .set('x-api-secret', tenant.apiSecret)
        .send({
          userId: user.id,
          type: 'BUY',
          token: 'BTC',
          pairToken: 'USDC',
          // pairTokenAmount is missing
        });

      expect(response.statusCode).toBe(400);
      expect(response.body).toEqual({
        message: 'pairTokenAmount must be greater than zero for BUY orders',
      });

      response = await request(app)
        .post('/api/quote')
        .set('x-api-key', tenant.apiKey)
        .set('x-api-secret', tenant.apiSecret)
        .send({
          userId: user.id,
          type: 'BUY',
          token: 'BTC',
          pairToken: 'USDC',
          pairTokenAmount: 0, // pairTokenAmount is zero
        });

      expect(response.statusCode).toBe(400);
      expect(response.body).toEqual({
        message: 'pairTokenAmount must be greater than zero for BUY orders',
      });
    });

    it('should return 400 if token is invalid', async () => {
      const response = await request(app)
        .post('/api/quote')
        .set('x-api-key', tenant.apiKey)
        .set('x-api-secret', tenant.apiSecret)
        .send({
          userId: user.id,
          type: 'BUY',
          token: 'INVALID_TOKEN',
          pairToken: 'USDC',
          pairTokenAmount: 10,
        });

      expect(response.statusCode).toBe(400);
      expect(response.body).toEqual({
        message: 'Invalid token or pairToken symbol',
      });
    });

    it('should return 400 if pairToken is invalid', async () => {
      const response = await request(app)
        .post('/api/quote')
        .set('x-api-key', tenant.apiKey)
        .set('x-api-secret', tenant.apiSecret)
        .send({
          userId: user.id,
          type: 'BUY',
          token: 'BTC',
          pairToken: 'INVALID_PAIR_TOKEN',
          pairTokenAmount: 10,
        });

      expect(response.statusCode).toBe(400);
      expect(response.body).toEqual({
        message: 'Invalid token or pairToken symbol',
      });
    });
  });

  describe('POST /api/quote', () => {
    it('should create a quote successfully', async () => {
      const response = await request(app)
        .post('/api/quote')
        .set('x-api-key', tenant.apiKey)
        .set('x-api-secret', tenant.apiSecret)
        .send({
          userId: user.id,
          type: 'BUY',
          token: 'BTC',
          pairToken: 'USDC',
          pairTokenAmount: 10, // 10 USDC
        });

      expect(response.statusCode).toBe(201);
      expect(response.body).toHaveProperty('quote');
    });
  });
});
