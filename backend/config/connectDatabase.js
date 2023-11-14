// Database connection initialization

const { Sequelize } = require('sequelize');

// We get these values from the ENV if we are in Docker env.
// Otherwise we use local testing values.
const host = process.env.DB_HOST || 'localhost';
const db_name = process.env.DB_NAME || 'gym-bro';
const db_username = process.env.DB_USERNAME || 'postgres';
const db_password = process.env.DB_PASSWORD || 'simo99123';

// Initialize the database connection
module.exports = new Sequelize(db_name, db_username, db_password, {
    host: host,
    dialect: 'postgres'
});