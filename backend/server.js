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
        
        if (response.status === 500) {
          res.status(500).send( {'error': 'Backend wasnt able to handle the given string.'} );
        } else {
          // Python server returned a valid response.
          const parsedData = response.data;
          let number_of_rows = 0;
          let promises = [];

          for (let i = 0; i < parsedData.training.length; i++) {
            const current_workout = parsedData.training[i];
            const exerciseId = randomatic('Aa0', 10); 

            const createPromise = exercisetable.create({
              id: exerciseId,
              username: username,
              exerciseName: current_workout.exerciseName,
              exercises: JSON.stringify(current_workout.exercises),
              comments: current_workout.comment
            });

            promises.push(createPromise);

            createPromise.then(newRow => {
              number_of_rows++;
              return credentials.update(
                { latestExercise: exerciseId },
                { where: { id: username } }
              );
            }).catch(error => {
              console.error('ERROR 1:', error);
              res.status(500).send();  
            });
          }

          Promise.all(promises)
            .then(() => {
              console.log('Inserted total of ' + number_of_rows + ' rows to the database.');
              res.status(201).json(parsedData.training).send(); 
            })
            .catch(error => {
              console.error('ERROR 2:', error);
              res.status(500).send();  
            });
        }
      } catch (error) {
        console.error('ERROR 3: ', error);
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
