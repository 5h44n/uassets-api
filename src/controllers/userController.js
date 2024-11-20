const { User } = require('../models');

// Get user by ID
exports.getUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findByPk(id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create a new user
exports.createUser = async (req, res) => {
    try {
        const { walletAddress } = req.body;

        // Validate walletAddress
        if (!walletAddress) {
            return res.status(400).json({ message: 'Wallet address is required' });
        }

        // Check if walletAddress already exists
        const existingUser = await User.findOne({ where: { walletAddress } });
        if (existingUser) {
            return res.status(400).json({ message: 'Wallet address already in use' });
        }

        // Create new user
        const user = await User.create({ walletAddress });

        res.status(201).json({ message: 'User created successfully', user });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update user by ID
exports.updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { walletAddress } = req.body;

        // Validate walletAddress
        if (!walletAddress) {
            return res.status(400).json({ message: 'Wallet address is required' });
        }

        // Check if the walletAddress already exists for another user
        const existingUser = await User.findOne({ where: { walletAddress } });
        if (existingUser && existingUser.id !== id) {
            return res.status(400).json({ message: 'Wallet address already in use' });
        }

        // Check if user exists
        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update user
        await user.update({ walletAddress });

        res.json({ message: 'User updated successfully', user });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
