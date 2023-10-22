// Backend for the gym-bro
// Simo Sjögren

const express = require('express');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const exphsb = require('express-handlebars');
const path = require('path');

const corsMiddleware = require('./middleware');
const userRouter = require('./userRoutes');

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

app.post('/post-workout', (req, res) => {
    console.log('Received /post-workout command.')
    const { fitnessGoal, latestWorkout } = req.body;

    // TODO establish a functionality which latest workout to the database.

    res.json({ latestWorkout });
});

app.get('/get-workout', (req, res) => {
    console.log('Received /get-workout command.')

    // TODO make a query to the database which retrieves the user's last workout.

    res.json({ testData })
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
