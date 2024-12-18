const request = require('supertest');
const app = require('../../server');
const { sequelize } = require('../../config/database');
const { User, Quote, Order, Tenant } = require('../../models');

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

describe('Order Controller', () => {
  let user;

  beforeEach(async () => {
    user = await User.create({
      tenantId: tenant.id,
      walletAddress: '0xf0b0Db37E6e0015360093aE564F7745549d8E635',
    });
    await Quote.create({
      userId: user.id,
      type: 'BUY',
      token: 'BTC',
      tokenAmount: 1,
      pairToken: 'USDC',
      pairTokenAmount: 10,
      deadline: Math.floor(Date.now() / 1000) + 60 * 60, // 1 hour
      blockchain: 'BASE',
      relayerNonce: 0,
    });
  });

  afterEach(async () => {
    await Order.destroy({ where: {} });
    await Quote.destroy({ where: {} });
    await User.destroy({ where: {} });
  });

  describe('POST /api/order', () => {
    it('should return 400 if required fields are missing', async () => {
      const response = await request(app)
        .post('/api/order')
        .set('x-api-key', tenant.apiKey)
        .set('x-api-secret', tenant.apiSecret)
        .send({
          // Missing quoteId and signature
        });

      expect(response.statusCode).toBe(400);
      expect(response.body).toEqual({ message: 'Missing required fields' });
    });

    it('should return 400 if quoteId is invalid', async () => {
      const response = await request(app)
        .post('/api/order')
        .set('x-api-key', tenant.apiKey)
        .set('x-api-secret', tenant.apiSecret)
        .send({
          quoteId: 'invalid-quote-id',
          signature: 'valid-signature',
        });

      expect(response.statusCode).toBe(400);
      expect(response.body).toEqual({ message: 'Invalid quoteId' });
    });

    it('should return 400 if quote has expired', async () => {
      const expiredQuote = await Quote.create({
        userId: user.id,
        type: 'BUY',
        token: 'BTC',
        tokenAmount: 1,
        pairToken: 'USDC',
        pairTokenAmount: 10,
        deadline: Math.floor(Date.now() / 1000) - 60 * 60, // 1 hour ago
        blockchain: 'BASE',
        relayerNonce: 0,
      });

      const response = await request(app)
        .post('/api/order')
        .set('x-api-key', tenant.apiKey)
        .set('x-api-secret', tenant.apiSecret)
        .send({
          quoteId: expiredQuote.id,
          signature: 'valid-signature',
        });

      expect(response.statusCode).toBe(400);
      expect(response.body).toEqual({ message: 'Quote has expired' });
    });
  });
});
