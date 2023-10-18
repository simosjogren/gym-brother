// Backend for the gym-bro
// Simo Sjögren

const express = require('express');
const bodyParser = require('body-parser');
const corsMiddleware = require('./middleware'); // Adjust the path as needed

const app = express();
app.use(bodyParser.json());
// Use the CORS middleware
app.use(corsMiddleware);

app.post('/generate-workout', (req, res) => {
    console.log('Received /generate-workout command')
    const { fitnessGoal, equipment, workoutPreferences } = req.body;

    // Here, you can process the received data and generate workout routines.
    // For now, we'll just return a mock workoutData object.
    const workoutData = [
        'Push Ups: 3 sets of 12 reps',
        'Squats: 3 sets of 10 reps',
        'Plank: Hold for 60 seconds'
    ];

    res.json({ workoutData });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
