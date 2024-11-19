const request = require('supertest');
const jwt = require('jsonwebtoken');
const express = require('express');
const protectedRoutes = require('../../routes/protectedRoutes');
const { authenticateToken } = require('../../middleware/authMiddleware');

jest.mock('jsonwebtoken');

describe('Protected Routes', () => {
    let app;
    let validToken;

    beforeEach(() => {
        app = express();
        app.use(express.json());
        app.use('/api/protected', protectedRoutes);
        validToken = 'valid-token';
        process.env.JWT_SECRET = 'test-secret';
    });

    it('should return 401 without token', async () => {
        const response = await request(app)
            .get('/api/protected/hello');
        expect(response.status).toBe(401);
    });

    it('should return hello message with valid token', async () => {
        jwt.verify.mockReturnValue({ userId: '123' });

        const response = await request(app)
            .get('/api/protected/hello')
            .set('Authorization', `Bearer ${validToken}`);
            
        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            message: 'Hello from protected route!'
        });
    });

    it('should return 403 with invalid token', async () => {
        jwt.verify.mockImplementation(() => {
            throw new Error('Invalid token');
        });

        const response = await request(app)
            .get('/api/protected/hello')
            .set('Authorization', 'Bearer invalid-token');
            
        expect(response.status).toBe(403);
    });
});
