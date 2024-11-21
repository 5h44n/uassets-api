async function executeOrder({ quote, signature }) {
  console.log('Executing order:', quote, signature);
  return true;
}

module.exports = {
  executeOrder,
};
