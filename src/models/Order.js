const { Model, DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./User');
const Quote = require('./Quote');

class Order extends Model {}

Order.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    quoteId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    transactionHash: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('PENDING', 'FAILED', 'CONFIRMED'),
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'Order',
    timestamps: true,
  }
);

module.exports = Order;
