// Connects to database's exercises- table.
// Using sequence instead of raw SQL-commands will decrease the risk of SQL-injection.
// Simo Sjögren


const { DataTypes } = require('sequelize');
const db = require('./connect_to_database');

const NewTable = db.define('training_data', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
    },
    exerciseName: {
        type: DataTypes.STRING(32),
        allowNull: false
    },
    username: {
        type: DataTypes.STRING(32),
        allowNull: false
    },
    exercises: {
        type: DataTypes.STRING(256),
        allowNull: false
    },
    comments: {
        type: DataTypes.STRING(128),
        allowNull: true     // Can be null
    }
});

module.exports = NewTable;
