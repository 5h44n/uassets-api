const { Quote } = require('../models');
const { executeOrder } = require('../services/orderService');

exports.createOrder = async (req, res) => {
  const {
    quoteId,
    signature
  } = req.body;

  // Validate required fields
  if (!quoteId || !signature) {
    return res.status(400).json({
      message: 'Missing required fields'
    });
  }

  // Validate quote exists
  const quote = await Quote.findByPk(quoteId);

  if (!quote) {
    return res.status(400).json({
      message: 'Invalid quoteId'
    });
  }

  // Validate quote has not expired
  if (quote.deadline < Math.floor(Date.now() / 1000)) {
    return res.status(400).json({
      message: 'Quote has expired'
    });
  }

  // Execute order
  const order = await executeOrder(quote, signature);

  return res.status(201).json(order);
}