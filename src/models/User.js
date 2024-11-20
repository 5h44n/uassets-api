const { Model, DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Quote = require('./Quote');
const Order = require('./Order');

class User extends Model {}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    walletAddress: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
      },
    },
  },
  {
    sequelize,
    modelName: 'User',
    timestamps: true,
  }
);

module.exports = User;
