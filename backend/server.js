// Main backend for the gym-bro
// Simo Sjögren

// Import regular packages
const express = require('express');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const exphsb = require('express-handlebars');
const path = require('path');
const axios = require('axios');
const { DataTypes } = require('sequelize');

// Import middleware-packages
const corsMiddleware = require('./middleware/CORS');
const userRouter = require('./middleware/userRoutes');
const verifyToken = require('./middleware/tokenVerification');

// Import database-settings
const db = require('./config/connect_to_database');
const sessiontokens = require('./config/tokens_connection');

const testData = {
    'username': '123testid99',
    'exercises': ['lat pulldown', 'bench press', 'squat']
}

// Test the database-connection status
db.authenticate()
    .then( ()=>console.log('Database connected') )
    .catch( err=> console.log('Error:' + err) )

// Sync all models with the database
db.sync()
    .then(() => {
        console.log('Database and models synced');
    })
    .catch(error => {
        console.error('Error syncing database:', error);
    });


const app = express();
app.use(bodyParser.json());
app.use(corsMiddleware); // CORS middleware
app.use(userRouter); // User login middleware

app.post('/post-workout', verifyToken, async (req, res) => {
    // We send the latest workout to the python server for parsing.
    console.log('Received /post-workout command.')
    const username = req.body.username;
    const fitnessGoal = req.body.fitnessGoal;
    const latestWorkout = req.body.latestWorkout;
    // Send latest workout to python server for parsing.
    try {
        const response = await axios.post('http://127.0.0.1:5000/parse-input', 
        { workoutString: latestWorkout }, 
        { headers: {
                'Content-Type': 'application/json',
            },
        });

        if (response.status !== 200) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const parsedData = response.data;

        // Lets connect to the user's training data table.
        const userDataTable = db.define(username + '_trainingdata', {
            exerciseName: {
                type: DataTypes.STRING(32),
                primaryKey: true,
                allowNull: false
            },
            exercises: {
                type: DataTypes.STRING(256),
                allowNull: false
            },
            exerciseComments: {
                type: DataTypes.STRING(128),
                allowNull: true     // Can be null
            }
        }, { force: true });
        const exercise_str = JSON.stringify(parsedData.exercises)   // Convert the list to str for db.
        userDataTable.create({
            exerciseName: parsedData.exerciseName,
            exercises: exercise_str,
            exerciseComments: parsedData.exerciseComments
        }).then(newRow => {
            console.log('New exercise row inserted in the database.')
            res.status(201).send()  // Row created successfully.
        }).catch(error => {
            console.error('ERROR:', error);
            res.status(500).send()  // Unknown error.
        })

        res.json({ latestWorkout: parsedData });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});



app.get('/get-workout', verifyToken, (req, res) => {
    console.log('Received /get-workout command.')
    const username = req.body.username;
    const fitnessGoal = req.body.fitnessGoal;
    const latestWorkout = req.body.latestWorkout;
    // TODO make a query to the database which retrieves the user's last workout.

    res.json({ testData })
});


app.get('/upgrade-workout', verifyToken, (req, res) => {
    console.log('Received /upgrade-workout command.')

    // TODO establish functionality which sends the string into a python microservice for parsing.
    // TODO establish functionality which sends the parsed string to the python microservice for upgrading progress.
    // TODO send the parsed workout into database.
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
