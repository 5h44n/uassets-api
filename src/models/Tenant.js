const { Model, DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

class Tenant extends Model {}

Tenant.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    apiKey: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    apiSecret: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'Tenant',
    timestamps: true,
  }
);

module.exports = Tenant;
