const jwt = require('jsonwebtoken');
const authController = require('../../controllers/authController');

// Mock jwt
jest.mock('jsonwebtoken');

describe('Auth Controller', () => {
  let mockReq;
  let mockRes;

  beforeEach(() => {
    // Reset mocks
    mockReq = {
      body: {}
    };
    mockRes = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis()
    };
    process.env.JWT_SECRET = 'test-secret';
  });

  describe('generateToken', () => {
    it('should generate access and refresh tokens successfully', async () => {
      // Mock JWT sign
      jwt.sign
        .mockReturnValueOnce('fake-access-token')
        .mockReturnValueOnce('fake-refresh-token');

      await authController.generateToken(mockReq, mockRes);

      expect(jwt.sign).toHaveBeenCalledTimes(2);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Tokens generated successfully',
        accessToken: 'fake-access-token',
        refreshToken: 'fake-refresh-token'
      });
    });

    it('should handle errors appropriately', async () => {
      jwt.sign.mockImplementation(() => {
        throw new Error('JWT Error');
      });

      await authController.generateToken(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'JWT Error'
      });
    });
  });

  describe('refreshToken', () => {
    it('should return error if no refresh token provided', async () => {
      await authController.refreshToken(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Refresh token is required'
      });
    });

    it('should generate new access token with valid refresh token', async () => {
      mockReq.body.refreshToken = 'valid-refresh-token';
      
      jwt.verify.mockReturnValue({ type: 'refresh' });
      jwt.sign.mockReturnValue('new-access-token');

      await authController.refreshToken(mockReq, mockRes);

      expect(jwt.verify).toHaveBeenCalledWith('valid-refresh-token', 'test-secret');
      expect(jwt.sign).toHaveBeenCalledTimes(1);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Token refreshed successfully',
        accessToken: 'new-access-token'
      });
    });

    it('should reject invalid refresh tokens', async () => {
      mockReq.body.refreshToken = 'invalid-token';
      
      jwt.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await authController.refreshToken(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Invalid or expired refresh token'
      });
    });
  });
});
