require('dotenv').config();
const request = require('supertest');
const app = require('../../server');
const { sequelize } = require('../../config/database');

beforeAll(async () => {
  await sequelize.sync({ force: true });
});

afterAll(async () => {
  await sequelize.close();
});

describe('Auth Controller', () => {
  describe('POST /api/auth/token', () => {
    it('should generate access and refresh tokens successfully', async () => {
      const response = await request(app).post('/api/auth/token');

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
    });
  });

  describe('POST /api/auth/refresh', () => {
    it('should return error if no refresh token provided', async () => {
      const response = await request(app).post('/api/auth/refresh');

      expect(response.statusCode).toBe(401);
      expect(response.body).toEqual({
        message: 'Refresh token is required',
      });
    });

    it('should generate new access token with valid refresh token', async () => {
      const tokenResponse = await request(app).post('/api/auth/token');
      const { refreshToken } = tokenResponse.body;

      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken });

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('accessToken');
    });

    it('should reject invalid refresh tokens', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: 'invalid-token' });

      expect(response.statusCode).toBe(401);
      expect(response.body).toEqual({
        message: 'Invalid or expired refresh token',
      });
    });
  });
});
