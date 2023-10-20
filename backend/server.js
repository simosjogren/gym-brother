// Backend for the gym-bro
// Simo Sjögren

const express = require('express');
const bodyParser = require('body-parser');
const exphsb = require('express-handlebars');
const path = require('path');
const corsMiddleware = require('./middleware'); // Adjust the path as needed

const db = require('./config/database');

const testData = {
    'user-id': '123testid99',
    'exercises': ['lat pulldown', 'bench press', 'squat']
}

// Test the database-connection status
db.authenticate()
    .then( ()=>console.log('Database connected') )
    .catch( err=> console.log('Error:' + err) )

const app = express();
app.use(bodyParser.json());
// Use the CORS middleware
app.use(corsMiddleware);

app.post('/post-workout', (req, res) => {
    console.log('Received /post-workout command.')
    const { fitnessGoal, latestWorkout } = req.body;

    // TODO establish a functionality which posts stuff to the database.

    res.json({ latestWorkout });
});

app.get('/get-workout', (req, res) => {
    console.log('Received /get-workout command.')

    // TODO establish a connection to the database

    res.json({ testData })
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
