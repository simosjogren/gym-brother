// Main backend for the gym-bro
// Simo Sjögren

// Import regular packages
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
// Import middleware-packages
const corsMiddleware = require('./middleware/CORS');
const userRouter = require('./middleware/userRoutes');
const verifyToken = require('./middleware/tokenVerification');
// Import database-settings
const db = require('./config/connectDatabase');
const exercisetable = require('./config/initializeExercises');
const credentials = require('./config/initalizeCredentials');
// Import controller functions
const { getLatestWorkoutData, createAndEditExerciseData, adjustLastExercises } = require('./controllers/workoutPostMethods');
// Import tools
const { inputParser, displayableFormatConverter } = require('./tools/inputParsing');


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
  console.log('Received /post-workout command.')
  const username = req.body.username;
  const latestWorkout = req.body.latestWorkout;
  const exerciseClass = req.body.exerciseClass;
  console.log('ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄ' + exerciseClass)
  
  // Send latest workout to python server for parsing.
    try {     
        const parsedInput = inputParser(latestWorkout, exerciseClass);
        if (parsedInput.length === 0) {
            throw new Error('Data is not in a valid format.');
        }
        getLatestWorkoutData(username).then(async (old_exercises)=>{
            console.log('Found exercises from last times:' + old_exercises);
            const { newIdList, oldIdList } = await createAndEditExerciseData(parsedInput, old_exercises, username);
            console.log('New exercise IDs: ' + newIdList);
            console.log('Old exercise IDs: ' + oldIdList);
            // Then we are gonna synchronize the latest exercises for the user's credentials latestExercise part.
            adjustLastExercises(newIdList, oldIdList, username)
            res.status(201).json(parsedInput).send();
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error }).send();
    }
});


app.post('/get-workout', verifyToken, async (req, res) => {
    console.log('Received /get-workout command.');
    const username = req.body.username;

    try {
        const retrievedDBUser = await credentials.findOne({
            where: { id: username }
        });

        if (retrievedDBUser) {
            console.log('Found user from the database.');
            const latestExercises = JSON.parse(retrievedDBUser.latestExercise);
            let exerciseList = [];

            for (let n = 0; n < latestExercises.length; n++) {
                const retrievedExercise = await exercisetable.findOne({
                    where: { id: latestExercises[n] }
                });
                const retrievedExerciseData = retrievedExercise.dataValues
                if (retrievedExercise) {
                    console.log('Found exercise ' + latestExercises[n] + ' from the database.');
                    exerciseList.push(retrievedExerciseData);
                    console.log('Retrieved exercise: ', retrievedExerciseData);
                } else {
                    console.log('Did not find the exercise.');
                }
            }
            const exerciseListString = displayableFormatConverter(exerciseList);
            // Now we should have all the exercise data in the exerciseList.
            res.status(201).json(exerciseListString).send();
        } else {
            console.log('Did not find the user.');
            res.status(404).json({ error: 'User not found' }).send();
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal Server Error' }).send();
    }
});


app.get('/upgrade-workout', verifyToken, (req, res) => {
    console.log('Received /upgrade-workout command.')
    const username = req.body.username;

    // TODO establish functionality which sends the string into a python microservice for parsing.
    // TODO establish functionality which sends the parsed string to the python microservice for upgrading progress.
    // TODO send the parsed workout into database.
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
