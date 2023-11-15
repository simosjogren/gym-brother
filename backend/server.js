// Main backend for the gym-bro
// Simo Sjögren

// Import regular packages
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

// Import middleware
const corsMiddleware = require('./middleware/CORS');
const userRouter = require('./middleware/userRoutes');
const verifyToken = require('./middleware/tokenVerification');

// Import controller functions
const {
    getLatestWorkoutData,
    createAndEditExerciseData,
    adjustLastExercises
} = require('./controllers/workoutPostMethods');

// Import database configurations
const db = require('./config/connectDatabase');
const exercisetable = require('./config/initializeExercises');
const credentials = require('./config/initalizeCredentials');

const PYTHON_BACKEND_URL = 'http://127.0.0.1:5000';

// Test the database-connection status
db.authenticate()
    .then(() => console.log('Database connected'))
    .catch(err => console.log('Error:' + err));

// Sync all models with the database
db.sync().then(() => {
    console.log('Database and models synced');
}).catch(error => {
    console.error('Error syncing database:', error);
});

// Initialize express server
const app = express();
app.use(bodyParser.json());
app.use(corsMiddleware); // CORS middleware
app.use(userRouter); // User login middleware

app.post('/post-workout', verifyToken, async (req, res) => {
    try {
        console.log('Received /post-workout command.');
        const username = req.body.username;
        const latestWorkout = JSON.parse(req.body.latestWorkout);

        if (latestWorkout.length === 0) {
            throw new Error('Data is not in a valid format.');
        }

        const old_exercises = await getLatestWorkoutData(username);
        const { newIdList, oldIdList } = await createAndEditExerciseData(latestWorkout, old_exercises, username);
        adjustLastExercises(newIdList, oldIdList, username);
        res.status(201).json(latestWorkout).send();
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message }).send();
    }
});

app.post('/get-workout', verifyToken, async (req, res) => {
    try {
        console.log('Received /get-workout command.');
        const username = req.body.username;

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

                if (retrievedExercise) {
                    console.log('Found exercise ' + latestExercises[n] + ' from the database.');
                    exerciseList.push(retrievedExercise.dataValues);
                } else {
                    console.log('Did not find the exercise.');
                }
            }
            res.status(201).json(exerciseList).send();
        } else {
            console.log('Did not find the user.');
            res.status(404).json({ error: 'User not found' }).send();
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' }).send();
    }
});

app.post('/upgrade-workout', verifyToken, async (req, res) => {
    try {
        console.log('Received /upgrade-workout command.')
        const username = req.body.username;
        const latestWorkouts = req.body.latestWorkout;
        const exerciseClass = req.body.exerciseClass;

        const response = await axios.post(PYTHON_BACKEND_URL + '/manual_upgrade', {
            username: username,
            latestWorkouts: latestWorkouts,
            exerciseClass: exerciseClass
        });

        console.log('Response from python server:', response.data);
        const newWorkouts = response.data.latestWorkouts;

        await createAndEditExerciseData(newWorkouts, latestWorkouts, username);
        res.status(200).json({ 'new_workouts': newWorkouts }).send();
    } catch (error) {
        console.error('Error making Axios request:', error);
        res.status(500).json({ error: 'Internal Server Error' }).send();
    }
});

app.post('/create-tab', verifyToken, async (req, res) => {
    try {
        const MAX_TABS = 10;
        const MAX_TAB_LENGTH = 20;
        console.log('Received /create-tab command.');
        const username = req.body.username;
        const tabName = req.body.newTabName;

        if (tabName.length > MAX_TAB_LENGTH) {
            res.status(413).json({ error: 'string_too_long' }).send();
            return;
        }

        const retrievedDBUser = await credentials.findOne({
            where: { id: username }
        });

        if (retrievedDBUser) {
            const tabs = JSON.parse(retrievedDBUser.tabs);

            if (tabs.length >= MAX_TABS) {
                res.status(413).json({ error: 'tabsamount_too_long' }).send();
                return;
            }

            tabs.push(tabName);
            await credentials.update(
                { tabs: JSON.stringify(tabs) },
                { where: { id: username } }
            );

            console.log('Tab created.');
            res.status(201).json({}).send();
        } else {
            res.status(404).json({ error: 'User not found' });
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message }).send();
    }
});

app.get('/get-tabs', verifyToken, async (req, res) => {
    try {
        console.log('Received /get-tabs command.');
        const username = req.query.username;
        const retrievedDBUser = await credentials.findOne({
            where: { id: username }
        });

        if (retrievedDBUser) {
            const tabs = JSON.parse(retrievedDBUser.tabs);

            if (tabs && tabs.length > 0) {
                res.status(200).json(tabs);
            } else {
                res.status(204).json({ message: 'No tabs created yet' });
            }
        } else {
            res.status(404).json({ error: 'User not found' });
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Open the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
