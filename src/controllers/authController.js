const jwt = require('jsonwebtoken');

// Generate access token

/**
 * @swagger
 * /token/generate:
 *   post:
 *     summary: Generate access and refresh tokens
 *     description: Generates a new access token (valid for 15 minutes) and a refresh token (valid for 7 days).
 *     tags:
 *       - Token
 *     responses:
 *       200:
 *         description: Tokens generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TokenResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
exports.generateToken = async (req, res) => {
  try {
    // Generate access token
    const accessToken = jwt.sign({ type: 'access' }, process.env.JWT_SECRET, {
      expiresIn: '15m',
    });

    // Generate refresh token with longer expiry
    const refreshToken = jwt.sign({ type: 'refresh' }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    res.json({
      message: 'Tokens generated successfully',
      accessToken,
      refreshToken,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Refresh access token

/**
 * @swagger
 * /token/refresh:
 *   post:
 *     summary: Refresh access token
 *     description: Refreshes an expired access token using a valid refresh token.
 *     tags:
 *       - Token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: The refresh token
 *                 example: eyJhbGciOiJIUzI1NiIsInR...
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RefreshResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token is required' });
    }

    // Verify refresh token
    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);

      if (decoded.type !== 'refresh') {
        return res.status(401).json({ message: 'Invalid refresh token' });
      }

      // Generate new access token
      const accessToken = jwt.sign({ type: 'access' }, process.env.JWT_SECRET, {
        expiresIn: '15m',
      });

      res.json({
        message: 'Token refreshed successfully',
        accessToken,
      });
    } catch (err) {
      return res
        .status(401)
        .json({ message: 'Invalid or expired refresh token' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
