const { User } = require('../models');

// Get user by ID

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get user by ID
 *     description: Retrieves a user by their unique ID.
 *     tags:
 *       - User
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the user to retrieve
 *     responses:
 *       200:
 *         description: User retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserResponse'
 *       404:
 *         description: User not found
 */

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
/**
 * @swagger
 * /users:
 *   post:
 *     summary: Create a new user
 *     description: Creates a new user with a unique wallet address.
 *     tags:
 *       - User
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateUserRequest'
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User created successfully
 *                 user:
 *                   $ref: '#/components/schemas/UserResponse'
 */

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
/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Update user by ID
 *     description: Updates the wallet address of an existing user.
 *     tags:
 *       - User
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the user to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUserRequest'
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User updated successfully
 *                 user:
 *                   $ref: '#/components/schemas/UserResponse'
 *       404:
 *         description: User not found
 */

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
