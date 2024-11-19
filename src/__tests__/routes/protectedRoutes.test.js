const request = require('supertest');
const jwt = require('jsonwebtoken');
const express = require('express');
const protectedRoutes = require('../../routes/protectedRoutes');

describe('Protected Routes', () => {
    let app;

    beforeEach(() => {
        app = express();
        app.use(express.json());
        app.use('/api/protected', protectedRoutes);
    });

    it('should return hello message', async () => {
        const response = await request(app)
            .get('/api/protected/hello');
            
        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            message: 'Hello from protected route!'
        });
    });
});
