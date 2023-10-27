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
const randomatic = require('randomatic');

// Import middleware-packages
const corsMiddleware = require('./middleware/CORS');
const userRouter = require('./middleware/userRoutes');
const verifyToken = require('./middleware/tokenVerification');

// Import database-settings
const db = require('./config/connect_to_database');
const sessiontokens = require('./config/tokens_connection');
const exercisetable = require('./config/new_datatable');
const credentials = require('./config/credentials_connection');

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
        const exercise_str = JSON.stringify(parsedData.exercises)   // Convert the list to str for db.

        // Time to insert new row to training_data -table.
        const exerciseId = randomatic('Aa0', 10);   // Generate a random id for the exercise.
        console.log('Exercise id: ' + exerciseId)
        exercisetable.create({
            id: exerciseId,
            username: username,
            exerciseName: parsedData.exerciseName,
            exercises: exercise_str,
            comments: parsedData.comment
        }).then(newRow => {
            console.log('New exercise row inserted in the database.')
                // Time to modify user's latest workout.
                credentials.update(
                    { latestExercise: exerciseId },
                    { where: { id: username } })
                    .then(retrievedDBUser => {
                        console.log('Modified ' + username + ' latest workout.')
                        res.status(201).send()  // Row created successfully.
                    })
                    .catch(error => {
                        console.error('ERROR:', error);
                        res.status(500).send()  // Unknown error.
                    })
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



app.post('/get-workout', verifyToken, (req, res) => {
    console.log('Received /get-workout command.')
    const username = req.body.username;
    const fitnessGoal = req.body.fitnessGoal;
    const latestWorkout = req.body.latestWorkout;
    // TODO make a query to the database which retrieves the user's last workout.

    credentials.findOne({
        where: { id: username }
    }).then(retrievedDBUser => {
        if (retrievedDBUser) {
            console.log('Found user from the database.')
            exercisetable.findOne({
                where: { id: retrievedDBUser.latestExercise }
            }).then(retrievedExercise => {
                if (retrievedExercise) {
                    console.log('Found exercise from the database.')
                    res.json({ latestWorkout: retrievedExercise })
                } else {
                    console.log('Did not find the exercise.')
                }
            })
        } else {
            console.log('Did not find the user.')
        }})
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
