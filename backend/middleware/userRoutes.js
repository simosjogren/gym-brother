// Middleware for the login-functionality
// Simo Sjögren

const express = require('express');
const bcrypt = require('bcrypt');
const credentials = require('../config/credentials_connection');
const createNewDatatable = require('../config/new_datatable');   // This is a function.

const userRouter = express.Router();

userRouter.post('/users', async (req,res) => {
    try {
        console.log('Post request to /users')
        console.log("Creating new account with username " + req.body.username)
        const hashedPassword = await bcrypt.hash(req.body.password, 10) // Salt with number 10
        const user = {'username': req.body.username, 'password': hashedPassword}
        console.log('Hashed password: ' + hashedPassword)
        
        // TODO: Better errorhandling
        credentials.findOne({
            where: { id: user.username }
        }).then(retrievedDBUser => {
            if(retrievedDBUser) {
                res.status(409).send()  // User exists.
            } else {
                // Inserts user's hashed credentials in to the database.
                credentials.create({
                    id: user.username,
                    password: user.password
                }).then(createdUser => {
                    createNewDatatable(user.username)
                    console.log('New user table created.')
                    res.status(201).send()  // User created successfully.
                }).catch(error => {
                    console.error('ERROR:', error);
                    res.status(500).send()  // Unknown error.
                });
            }
        }).catch(error => {
            console.log('ERROR: ' + error)
            res.status(500).send()  // Unknown error.
        })
    } catch {error => {
        console.log('ERROR: ' + error)
        res.status(500).send()  // Unknown error.
    }
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
