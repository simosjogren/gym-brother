// Backend for the gym-bro
// Simo Sjögren

const express = require('express');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const exphsb = require('express-handlebars');
const path = require('path');
const corsMiddleware = require('./middleware'); // Adjust the path as needed

const db = require('./config/database');

const testData = {
    'username': '123testid99',
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

    // TODO establish a functionality which latest workout to the database.

    res.json({ latestWorkout });
});

app.get('/get-workout', (req, res) => {
    console.log('Received /get-workout command.')

    // TODO make a query to the database which retrieves the user's last workout.

    res.json({ testData })
});

app.post('/users', async (req,res) => {
    try {
        console.log('Post request to /users')
        console.log("Creating new account with username " + req.body.username)
        const hashedPassword = await bcrypt.hash(req.body.password, 10) // Salt with number 10
        const user = {'username': req.body.username, 'password': hashedPassword}
        console.log('Hashed password: ' + hashedPassword)

        // TODO: Check if account already exists or not in the database.
        // TODO: Create a new account to the users-table of the database.
        // TODO: Create a new table to the database according to username & password.

        res.status(201).send()
    } catch {
        res.status(500).send()
    }
})

app.post('/users/login', async (req,res) => {
    console.log('Post request to /users/login')
    console.log("Trying to sign in with the username " + req.body.username)

    // TODO implement a functionality which checks if the account exists from database.
    // and retrieves the password at the same time.

    const testPassword = '$2b$10$hj3.3Jj7PNxcgxSR2.LU1eDcYrn69QqbuLiuA3YPoCysRQUxkzmAW'

    try {
        if (await bcrypt.compare(req.body.password, testPassword)) {
            // Correct password

            // TODO send cookie

            res.status(200).send()
        } else {
            // Wrong password
            res.status(401).send()
        }
    } catch {
        // Unknown error
        res.status(500).send()
    }
})

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
