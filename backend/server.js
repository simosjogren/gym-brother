// Backend for the gym-bro
// Simo Sjögren

const express = require('express');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const exphsb = require('express-handlebars');
const path = require('path');
const corsMiddleware = require('./middleware'); // Adjust the path as needed

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
    
        // Inserts user's hashed credentials to the database.
        credentials.create({
            id: user.username,
            password: user.password
        }).then(user => {
            console.log('User created:', user);
        }).catch(error => {
            console.error('Error creating user:', error);
        });
    
        // TODO: Create a new table to the database according to username & password.
    
        res.status(201).send()
    } catch {
        res.status(500).send()
    }
})

app.post('/users/login', async (req,res) => {
    const user = {
        username: req.body.username,
        password: req.body.password
    }
    console.log('Post request to /users/login')
    
    // SQL-query for given username
    credentials.findOne({
        where: { id: user.username }
    })
    .then(retrievedDBUser => {
        console.log(retrievedDBUser.createdAt)
        // Checking if the user is found.
        if (retrievedDBUser) {
            try {
                // Password comparision
                bcrypt.compare(user.password, retrievedDBUser.password)
                .then(isMatch => {
                    if (isMatch) {
                        // Correct password
                        console.log('Password was correct.')
            
                        // TODO send cookie
        
                        res.status(200).send()
                    } else {
                        // Wrong password
                        console.log('Password was INCORRECT.')
                        res.status(401).send()
                    }
                })
                .catch(error => {
                    console.error('Error comparing passwords:', error);
                    res.status(500).send();
                });
            } catch (error) {
                console.error('Error:', error);
                res.status(500).send();
            }
        } else {
            res.status(404).send('User not found');
        }
    })
    .catch(error => {
        console.error('Error fetching user:', error);
        res.status(500).send('Error fetching user');
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
