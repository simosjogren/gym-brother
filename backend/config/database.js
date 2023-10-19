// Database connection initialization

const { Sequelize } = require('sequelize');

// Initialize the database connection
module.exports = new Sequelize('gym-bro', 'postgres', 'simo99123', {
    host: 'localhost',
    dialect: 'postgres'
});