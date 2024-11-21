require('dotenv').config();
const { Sequelize } = require('sequelize');
const path = require('path');

const isTestEnv = process.env.NODE_ENV === 'test';

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: isTestEnv ? ':memory:' : path.join(__dirname, '../../data/database.sqlite'),
    logging: false
});

const connectDB = async () => {
    try {
        await sequelize.authenticate();
        await sequelize.sync();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = { connectDB, sequelize };
