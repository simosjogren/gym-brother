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


function displayableFormatConverter(exerciseList) {
    // We convert the JSON received from python backend into a displayable format in JS.
        let displayableString = "";
        for (let n = 0; n < exerciseList.length; n++) {
            displayableString += exerciseList[n].exerciseName + ": ";
            const current_exercise = JSON.parse(exerciseList[n].exercises);
            for (let i = 0; i < current_exercise.length; i++) {
                console.log(current_exercise[i])    
                if (current_exercise[i].both_sides) {
                    displayableString += current_exercise[i].weights + '+' + current_exercise[i].weights;
                } else {
                    displayableString += current_exercise[i].weights;
                }
                displayableString += ', ';
                displayableString += current_exercise[i].reps[0];
                for (let m = 1; m < current_exercise[i].reps.length; m++) {
                    displayableString += '/';
                    displayableString += current_exercise[i].reps[m];
                }
                if (current_exercise[i].comments !== "") {
                    displayableString += ', ';
                    displayableString += exerciseList[n].comments;
                }
            }
            displayableString += '\n';
        }
        return displayableString;
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
        const new_exercises = response.data.training;
        console.log('Received parsed data from python server:', new_exercises);
        getLatestWorkoutData(username).then(async (old_exercises)=>{
          console.log('Found exercises from last times:' + old_exercises);
          const { newIdList, oldIdList } = await createAndEditExerciseData(new_exercises, old_exercises, username);
          console.log('New exercise IDs: ' + newIdList);
          console.log('Old exercise IDs: ' + oldIdList);
          // Then we are gonna synchronize the latest exercises for the user's credentials latestExercise part.
          adjustLastExercises(newIdList, oldIdList, username)
          res.status(201).json(new_exercises).send();
        });
      }
    } catch (error) {
      console.error('ERROR 3: ', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
});


app.post('/get-workout', verifyToken, async (req, res) => {
    console.log('Received /get-workout command.');
    const username = req.body.username;
    const fitnessGoal = req.body.fitnessGoal;
    const latestWorkout = req.body.latestWorkout;

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

    // TODO establish functionality which sends the string into a python microservice for parsing.
    // TODO establish functionality which sends the parsed string to the python microservice for upgrading progress.
    // TODO send the parsed workout into database.
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
