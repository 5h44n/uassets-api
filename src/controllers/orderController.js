const { Quote, User } = require('../models');
const { executeOrder } = require('../services/orderService');

/**
 * @swagger
 * /order:
 *   post:
 *     summary: Create an order
 *     description: Creates an order based on a valid quote and executes it.
 *     tags:
 *       - Order
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateOrderRequest'
 *     responses:
 *       201:
 *         description: Order created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OrderResponse'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
exports.createOrder = async (req, res) => {
  const { quoteId, signature } = req.body;

  // Validate required fields
  if (!quoteId || !signature) {
    return res.status(400).json({
      message: 'Missing required fields',
    });
  }

  // Validate quote exists
  const quote = await Quote.findByPk(quoteId);
  if (!quote) {
    return res.status(400).json({
      message: 'Invalid quoteId',
    });
  }

  // Validate quote belongs to tenant
  const tenantId = req.tenant.id;
  const user = await User.findByPk(quote.userId);

  if (user.tenantId !== tenantId) {
    return res.status(400).json({
      message: 'Invalid quoteId',
    });
  }

  // Validate quote has not expired
  if (quote.deadline < Math.floor(Date.now() / 1000)) {
    return res.status(400).json({
      message: 'Quote has expired',
    });
  }

  // Execute order
  const order = await executeOrder(quote, signature);

  return res.status(201).json(order);
};
