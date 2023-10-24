// Connects to database's tokens table.
// Using sequence instead of raw SQL-commands will decrease the risk of SQL-injection.
// Simo Sjögren

const { DataTypes } = require('sequelize');
const db = require('./connect_to_database');

const dbTokens = db.define('sessiontokens', {
  id: {
    type: DataTypes.STRING(30),
    primaryKey: true,
    allowNull: false
  },
  token: {
    type: DataTypes.STRING(30),
    allowNull: false
  }
});

module.exports = dbTokens;