const jwt = require('jsonwebtoken');

// Generate access token
exports.generateToken = async (req, res) => {
    try {
        // Generate access token
        const accessToken = jwt.sign(
            { type: 'access' },
            process.env.JWT_SECRET,
            { expiresIn: '15m' }
        );

        // Generate refresh token with longer expiry
        const refreshToken = jwt.sign(
            { type: 'refresh' },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            message: 'Tokens generated successfully',
            accessToken,
            refreshToken
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Refresh access token
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
            const accessToken = jwt.sign(
                { type: 'access' },
                process.env.JWT_SECRET,
                { expiresIn: '15m' }
            );

            res.json({
                message: 'Token refreshed successfully',
                accessToken
            });

        } catch (err) {
            return res.status(401).json({ message: 'Invalid or expired refresh token' });
        }

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
