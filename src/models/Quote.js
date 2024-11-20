const { Model, DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./User');

class Quote extends Model {}

Quote.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM('BUY', 'SELL'),
      allowNull: false,
    },
    token: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    tokenAmount: {
      type: DataTypes.DECIMAL,
      allowNull: false,
    },
    pairToken: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    pairTokenAmount: {
      type: DataTypes.DECIMAL,
      allowNull: true,
    },
    deadline: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    blockchain: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    relayerNonce: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'Quote',
    timestamps: true,
  }
);

module.exports = Quote;
