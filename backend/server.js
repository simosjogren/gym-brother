// Main backend for the gym-bro
// Simo Sjögren

// Import regular packages
const express = require('express');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const exphsb = require('express-handlebars');
const path = require('path');
const axios = require('axios');


// Import middleware-packages
const corsMiddleware = require('./middleware/CORS');
const userRouter = require('./middleware/userRoutes');

// Import database-settings
const db = require('./config/database');
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

app.post('/post-workout', async (req, res) => {
    // We send the latest workout to the python server for parsing.
    console.log('Received /post-workout command.')
    const { fitnessGoal, latestWorkout } = req.body;

    try {
        const response = await axios.post('http://127.0.0.1:5000/parse-input', { string: latestWorkout }, {
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (response.status !== 200) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const parsedData = response.data;

        // TODO: Send the parsed workout into database.
        // Next time the user refreshes the page, the workout is parsed in a better way.

        res.json({ latestWorkout: parsedData });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});



app.get('/get-workout', (req, res) => {
    console.log('Received /get-workout command.')

    // TODO make a query to the database which retrieves the user's last workout.

    res.json({ testData })
});


app.get('/upgrade-workout', (req, res) => {
    console.log('Received /upgrade-workout command.')

    // TODO establish functionality which sends the string into a python microservice for parsing.
    // TODO establish functionality which sends the parsed string to the python microservice for upgrading progress.
    // TODO send the parsed workout into database.
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
