require('dotenv').config();
const { ethers } = require('ethers');
const { DutchOrderBuilder, NonceManager } = require('@uniswap/uniswapx-sdk');
const { Quote } = require('../models');
const { TOKEN_ADDRESSES, PAIR_TOKEN_ADDRESSES } = require('../config/tokenAddresses');
const OrderQuoterABI = require('../abi/OrderQuoter.json');

const QUOTER_ADDRESS = process.env.QUOTER_ADDRESS;
const RPC_URL = process.env.RPC_URL;

// config.chains[8453] = {
//   permit2: '0x000000000022D473030F116dDEE9F6B43aC78BA3',
//   quoter: '0x88440407634f89873c5d9439987ac4be9725fea8',
// };

// Initialize provider and contracts
const provider = new ethers.JsonRpcProvider(RPC_URL);
const orderQuoter = new ethers.Contract(QUOTER_ADDRESS, OrderQuoterABI, provider);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

async function generateQuote({
  user,
  type,
  tokenAddress,
  tokenAmount,
  pairTokenAddress,
  pairTokenAmount,
}) {
  try {
    // Setup order parameters
    const chainId = 8453; // BASE chain
    const deadline = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now

    // Get nonce
    const nonceMgr = new NonceManager(provider, chainId);
    const nonce = await nonceMgr.useNonce(user.walletAddress);

    // Build order
    const builder = new DutchOrderBuilder(chainId);
    const order = builder
      .deadline(deadline)
      .decayEndTime(deadline)
      .decayStartTime(deadline - 100)
      .nonce(nonce)
      .input({
        token: quote.type == 'BUY' ? pairTokenAddress : tokenAddress,
        amount: quote.type == 'BUY' ? pairTokenAmount : tokenAmount,
      })
      .output({
        token: tokenAddress,
        startAmount: ethers.parseUnits('0', 18),
        endAmount: ethers.parseUnits('100000000000', 18), // estimate with a wide range until we incorprate slippage
        recipient: user.walletAddress,
      })
      .build();

    // Sign the order
    const { domain, types, values } = order.permitData();
    const signature = await wallet._signTypedData(domain, types, values);

    // Get quote from contract
    const serializedOrder = order.serialize();
    const resolvedOrder = await orderQuoter.quote(serializedOrder, signature);

    const { info, outputs } = resolvedOrder;

    if (!outputs || outputs.length === 0) {
      throw new Error('Quote must have at least one output token');
    }

    const primaryOutput = outputs[0];

    // Save quote to database and return
    const quote = await Quote.create({
      userId: user.id,
      type,
      token: tokenAddress,
      tokenAmount: ethers.toBigInt(tokenAmount),
      pairToken: pairTokenAddress,
      pairTokenAmount: primaryOutput.amount,
      blockchain: 'BASE',
      deadline: info.deadline.toString(),
      relayerNonce: parseInt(info.nonce),
    });

    return quote;
  } catch (error) {
    console.error('Error generating quote:', error);
    throw error;
  }
}

module.exports = {
  generateQuote,
};
