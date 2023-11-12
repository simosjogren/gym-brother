// Connects to database's tokens table.
// Using sequence instead of raw SQL-commands will decrease the risk of SQL-injection.
// Simo Sjögren

const { DataTypes } = require('sequelize');
const db = require('./connectDatabase');

const sessionTokens = db.define('sessiontokens', {
  id: {
    type: DataTypes.STRING(30),
    primaryKey: true,
    allowNull: false
  },
  token: {
    type: DataTypes.STRING(256),
    allowNull: false
  }
});

module.exports = sessionTokens;