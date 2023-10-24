const { DataTypes } = require('sequelize');
const db = require('./connect_to_database');

async function createNewDatatable(username) {
    try {
        console.log('Name of the user: ' + username)
        const NewTable = db.define(username + '_trainingdata', {
            exerciseName: {
                type: DataTypes.STRING(32),
                primaryKey: true,
                allowNull: false
            },
            exerciseWeights: {
                type: DataTypes.INTEGER(),
                allowNull: false
            },
            exerciseReps: {
                type: DataTypes.INTEGER(),
                allowNull: true     // Can be null
            },
            exerciseComments: {
                type: DataTypes.STRING(128),
                allowNull: true     // Can be null
            }
        }, { force: true });

        await db.sync(); // Sync the model with the database

        return NewTable;
    } catch (error) {
        throw new Error('Error creating datatable: ' + error.message);
    }
}

module.exports = createNewDatatable;
