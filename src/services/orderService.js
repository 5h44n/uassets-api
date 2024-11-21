const ExecutiveDutchOrderReactorABI = require('../abi/ExecutiveDutchOrderReactor.json');
const { serializeQuote } = require('./quoteService');
const { ethers } = require('ethers');

const REACTOR_ADDRESS = process.env.REACTOR_ADDRESS;
const RPC_URL = process.env.RPC_URL;

const provider = new ethers.JsonRpcProvider(RPC_URL);
const reactor = new ethers.Contract(
  REACTOR_ADDRESS,
  ExecutiveDutchOrderReactorABI,
  provider
);

async function executeOrder({ quote, signature }) {
  console.log('Executing order:', quote, signature);
  const serializedOrder = await serializeQuote(quote);
  const tx = await reactor.execute(serializedOrder, signature);
  await tx.wait();

  return tx.hash;
}

module.exports = {
  executeOrder,
};
