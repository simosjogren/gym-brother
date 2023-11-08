// Middleware for the login-functionality
// Simo Sjögren

const credentials = require('../config/initalizeCredentials');
const sessiontokens = require('../config/initializeSessionTokens');

const express = require('express');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const path = require('path');

const verifyToken = require('./tokenVerification');
require('dotenv').config(path.resolve(__dirname, '../.env'));

const userRouter = express.Router();

userRouter.post('/users', async (req,res) => {
    try {
        console.log('Post request to /users')
        console.log("Creating new account with username " + req.body.username)
        const hashedPassword = await bcrypt.hash(req.body.password, 10) // Salt with number 10
        const user = {'username': req.body.username, 'password': hashedPassword, 'fitnessGoal': req.body.fitnessGoal}
        console.log('Fitness-goal: ', user.fitnessGoal);
        
        // TODO: Better error-handling
        credentials.findOne({
            where: { id: user.username }
        }).then(retrievedDBUser => {
            if (retrievedDBUser) {
                res.status(409).send()  // User exists.
            } else {
                // Inserts user's hashed credentials in to the database.
                credentials.create({
                    id: user.username,
                    password: user.password,
                    latestExercise: '[]',
                    fitnessGoal: user.fitnessGoal,
                    tabs: '[]'
                }).then(createdUser => {
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
                        // Correct password. Now we create the cookie.
                        console.log('Password was correct.')
                        const secretKey = crypto.randomBytes(32).toString('hex');   // Create secret key
                        const token = jwt.sign({ username: user.username }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
                        console.log('Token: ' + token)
                        res.json({ token: token });
                        // Time to save the cookie to database.
                        sessiontokens.findOrCreate({
                            where: { id: user.username },
                            defaults: { token: token }
                        }).then(([tokenRecord, created]) => {
                            if (!created) {
                              // Token already existed, update it
                              tokenRecord.update({ token: token })
                                .then(updatedToken => {
                                  res.status(200).send(); // Token updated successfully
                                })
                                .catch(error => {
                                  console.error('ERROR:', error);
                                  res.status(500).send(); // Error updating token
                                });
                            } else {
                              res.status(200).send(); // Token created successfully
                            }
                          }).catch(error => {
                            console.error('ERROR:', error);
                            res.status(500).send(); // Error finding or creating token
                          });
                                              
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


userRouter.post('/users/logout', verifyToken, async (req,res) => {
    console.log('Post request to /users/logout')
    const username = req.body.username
    sessiontokens.destroy({
        where: { id: username }
    }).then(()=>{
        console.log('Token deleted.')
        res.status(200).send()
    }).catch(error => {
        console.error('Error:', error);
        res.status(500).send();
    });
});

module.exports = userRouter;
