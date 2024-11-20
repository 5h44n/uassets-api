const { User } = require('../models');
const { TOKEN_ADDRESSES, PAIR_TOKEN_ADDRESSES } = require('../config/tokenAddresses');
const { generateQuote } = require('../services/quoteService');

exports.createQuote = async (req, res) => {
    try {
        const {
            userId,
            type,
            token,
            tokenAmount,
            pairToken,
            pairTokenAmount,
        } = req.body;

        // Validate required fields
        if (!userId || !type || !token || !pairToken) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // Validate user exists
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(400).json({ message: 'Invalid userId' });
        }

        // Validate 'type' field
        if (!['BUY', 'SELL'].includes(type)) {
            return res.status(400).json({ message: 'Invalid type' });
        }

        // Validate 'tokenAmount' and 'pairTokenAmount'
        if (type === 'SELL' && (!tokenAmount || tokenAmount <= 0)) {
            return res
                .status(400)
                .json({ message: 'tokenAmount must be greater than zero for SELL orders' });
        }
        if (type === 'BUY' && (!pairTokenAmount || pairTokenAmount <= 0)) {
            return res
                .status(400)
                .json({ message: 'pairTokenAmount must be greater than zero for BUY orders' });
        }

        // Validate token and pairToken symbols
        const tokenAddress = TOKEN_ADDRESSES[token];
        const pairTokenAddress = PAIR_TOKEN_ADDRESSES[pairToken];

        if (!tokenAddress || !pairTokenAddress) {
            return res
                .status(400)
                .json({ message: 'Invalid token or pairToken symbol' });
        }

        // Call the quoteService to generate the quote
        const quote = await generateQuote({
            user,
            type,
            tokenAddress,
            tokenAmount,
            pairTokenAddress,
            pairTokenAmount,
        });

        // Return the quote in the response
        return res.status(201).json({ message: 'Quote created successfully', quote });
    } catch (error) {
        console.error('Error in createQuote:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};
