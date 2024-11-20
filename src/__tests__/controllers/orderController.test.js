const request = require('supertest');
const app = require('../../server');
const { sequelize } = require('../../config/database');
const jwt = require('jsonwebtoken');
const { User, Quote, Order } = require('../../models');

let token;

beforeAll(async () => {
  await sequelize.sync({ force: true });
  token = jwt.sign({ type: 'access' }, process.env.JWT_SECRET, { expiresIn: '15m' });
});

afterAll(async () => {
  await sequelize.close();
});

describe('Order Controller', () => {
  let user;
  let quote;

  beforeEach(async () => {
    user = await User.create({ walletAddress: '0xf0b0Db37E6e0015360093aE564F7745549d8E635' });
    quote = await Quote.create({
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
        .set('Authorization', `Bearer ${token}`)
        .send({
          // Missing quoteId and signature
        });

      expect(response.statusCode).toBe(400);
      expect(response.body).toEqual({ message: 'Missing required fields' });
    });

    it('should return 400 if quoteId is invalid', async () => {
      const response = await request(app)
        .post('/api/order')
        .set('Authorization', `Bearer ${token}`)
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
        .set('Authorization', `Bearer ${token}`)
        .send({
          quoteId: expiredQuote.id,
          signature: 'valid-signature',
        });

      expect(response.statusCode).toBe(400);
      expect(response.body).toEqual({ message: 'Quote has expired' });
    });

    it('should return 401 if access token is missing', async () => {
      const response = await request(app)
        .post('/api/order')
        // access token is missing
        .send({
          quoteId: quote.id,
          signature: 'valid-signature',
        });

      expect(response.statusCode).toBe(401);
      expect(response.body).toEqual({ message: 'Access token is required' });
    });

    it('should return 403 if access token is invalid', async () => {
      const response = await request(app)
        .post('/api/order')
        .set('Authorization', `Bearer invalid_token`)
        .send({
          quoteId: quote.id,
          signature: 'valid-signature',
        });

      expect(response.statusCode).toBe(403);
      expect(response.body).toEqual({ message: 'Invalid or expired token' });
    });
  });
});
