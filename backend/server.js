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
const exercises = require('./config/new_datatable');

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


async function getLatestWorkoutData(username) {
  let exerciseList = [];
  try {
    const dbUser = await credentials.findOne({
      where: { id: username }
    });
    const latestExercises = JSON.parse(dbUser.latestExercise);
    console.log('Latest Exercises:', latestExercises); // Debug log

    for (let n = 0; n < latestExercises.length; n++) {
      const foundRow = await exercises.findOne({
        where: { id: latestExercises[n], username: username }
      });
      console.log('Found Row:', foundRow.dataValues); // Debug log

      if (foundRow) {
        exerciseList.push(foundRow.dataValues);
      } else {
        console.log('Exercise not found in the database:', latestExercises[n]);
      }
    }
    if (exerciseList.length === 0) {
      console.log('Did not find any matching exercises.')
    }
    return exerciseList;
  } catch (error) {
    console.log('Error: ', error);
    return null;
  }
}

const app = express();
app.use(bodyParser.json());
app.use(corsMiddleware); // CORS middleware
app.use(userRouter); // User login middleware

app.post('/post-workout', verifyToken, async (req, res) => {
  console.log('Received /post-workout command.')
  const username = req.body.username;
  const fitnessGoal = req.body.fitnessGoal;
  const latestWorkout = req.body.latestWorkout;

  // TODO: 
  
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
        const parsedData = response.data.training;
        console.log('Received parsed data from python server:', parsedData);
        getLatestWorkoutData(username).then(async (exerciseList)=>{
          console.log('Found exercises from last times:' + exerciseList);
          const idList = exerciseList.map(item => item.id);
          console.log('According IDs:' + idList);
          for (let i=0; i < parsedData.length; i++) {
            const foundMatchingIndex = exerciseList.findIndex((item) => item.exerciseName === parsedData[i].exerciseName);
            // This returns index of exerciseList.
            if (foundMatchingIndex === -1) {
              // This means that the exercise is new and should be added to the database.
              console.log('Adding new exercise to the database.')
              const exerciseId = randomatic('Aa0', 10);
              await exercisetable.create({
                id: exerciseId,
                username: username,
                exerciseName: parsedData[i].exerciseName,
                exercises: JSON.stringify(parsedData[i].exercises),
                comments: parsedData[i].comment
              });
              console.log('Created new row to the database.');
              const updatedCredentials = await credentials.findOne({ where: { id: username } });
              const currentLatestExercises = JSON.parse(updatedCredentials.latestExercise);
              currentLatestExercises.push(exerciseId);
              await credentials.update(
                { latestExercise: JSON.stringify(currentLatestExercises) },
                { where: { id: username } }
              );
              console.log('Updated latest exercises for user.');
            } else {
              // This means the exercise is already in the database and should be updated.
              await exercisetable.update(
                { exercises: JSON.stringify(parsedData[i].exercises), comments: parsedData[i].comment },
                { where: { id: idList[foundMatchingIndex], username: username } }
              );
              console.log(`Updated exercise for ID ${exerciseList[foundMatchingIndex].id}`);
            }
          }
          res.status(201).json(parsedData).send();
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
