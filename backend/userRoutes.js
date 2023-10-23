// Middleware for the login-functionality
// Simo Sjögren

const express = require('express');
const bcrypt = require('bcrypt');
const credentials = require('./config/credentials_connection');

const userRouter = express.Router();

userRouter.post('/users', async (req,res) => {
    try {
        console.log('Post request to /users')
        console.log("Creating new account with username " + req.body.username)
        const hashedPassword = await bcrypt.hash(req.body.password, 10) // Salt with number 10
        const user = {'username': req.body.username, 'password': hashedPassword}
        console.log('Hashed password: ' + hashedPassword)
    
        credentials.findOne({
            where: { id: user.username }
        }).then(retrievedDBUser => {
            if(retrievedDBUser) {
                console.log('User already exists.')
                res.status(409).send()
            } else {
                console.log('User does not exists.')
                // Inserts user's hashed credentials to the database
                credentials.create({
                    id: user.username,
                    password: user.password
                }).then(user => {
                    console.log('User created:', user);
                }).catch(error => {
                    console.error('Error creating user:', error);
                });
                // TODO: Create a new table to the database according to username & password

                res.status(201).send()
            }
        }).catch(error => {
            console.log('Unknown error.')
        })
    } catch {
        res.status(500).send()
    }
});

userRouter.post('/users/login', async (req,res) => {
    const user = {
        username: req.body.username,
        password: req.body.password
    }
    console.log('Post request to /users/login')
    
    // SQL-query for given username
    credentials.findOne({
        where: { id: user.username }
    }).then(retrievedDBUser => {
        console.log(retrievedDBUser.createdAt)
        // Checking if the user is found
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

module.exports = userRouter;
