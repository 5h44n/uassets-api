const { Tenant } = require('../models');

const authenticateApi = async (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  const apiSecret = req.headers['x-api-secret'];

  if (!apiKey || !apiSecret) {
    return res.status(401).json({ message: 'API Key and Secret are required' });
  }

  // Validate API Key and Secret
  const tenant = await Tenant.findOne({ where: { apiKey, apiSecret } });
  if (!tenant) {
    return res.status(403).json({ message: 'Invalid API credentials' });
  }

  // Attach tenant to request object
  req.tenant = tenant;

  next();
};

module.exports = { authenticateApi };
