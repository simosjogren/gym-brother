// Connection config file for user authentication.
// Using sequence instead of raw SQL-commands will decrease the risk of SQL-injection.
// Simo Sjögren

const { DataTypes } = require('sequelize');
const db = require('./connectDatabase');

const dbCredentials = db.define('credentials', {
  id: {
    type: DataTypes.STRING(30),
    primaryKey: true,
    allowNull: false
  },
  password: {
    type: DataTypes.STRING(30),
    allowNull: false
  },
  latestExercise: {
    type: DataTypes.STRING(256),
    allowNull: false
  }
});

module.exports = dbCredentials;