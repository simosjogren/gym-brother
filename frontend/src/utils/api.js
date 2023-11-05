import { displayableFormatConverter } from './displayableFormatConverter.js';
import { inputParser } from './inputParser.js';
import { createTabItem } from '../components/tabs.js';
import { showLogin } from '../components/login.js';
import { SERVER_ADDRESS } from '../constants.js';

export function getWorkout() {
    fetch(SERVER_ADDRESS + '/get-workout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                username: localStorage.getItem('username')
            }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.length === 0) {
                localStorage.setItem('workoutData', JSON.stringify([]));
            } else {
                for (let n = 0; n < data.length; n++) {
                    data[n].exercises = JSON.parse(data[n].exercises);
                }
                localStorage.setItem('workoutData', JSON.stringify(data));
            }
            // Small parsing for the workout data:
            const exerciseClass = localStorage.getItem('selectedTab');
            const displayableString = displayableFormatConverter(data, exerciseClass);
            document.getElementById('latestWorkout').value = displayableString;
        })
        .catch(error => {
            console.error('Error:', error);
        });
}


export function postWorkout() {
    const savedMessage = document.getElementById('workoutSavedMessage');
    const savedTime = document.getElementById('savedTime');
    const exerciseClass = localStorage.getItem('selectedTab');
    const latestWorkout = JSON.parse(localStorage.getItem('workoutData'));

    // Here we do the local browser saving process.
    const currentTabWorkout = document.getElementById('latestWorkout').value;
    const parsedWorkout = inputParser(currentTabWorkout, exerciseClass);
    let latestWorkout_str = '';
    for (let n=0; n < parsedWorkout.length; n++) {
        if (latestWorkout.includes(parsedWorkout[n])) {
            continue;
        } else {
            latestWorkout.push(parsedWorkout[n]);
        }
        latestWorkout_str = JSON.stringify(latestWorkout);
        localStorage.setItem('workoutData', latestWorkout_str);
    }

    const data = {
        username: localStorage.getItem('username'),
        latestWorkout: latestWorkout_str,
        exerciseClass: exerciseClass
    };

    const token = localStorage.getItem('token');

    // Goes to backend in good format.
    fetch(SERVER_ADDRESS + '/post-workout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data),
        })
        .then(response => {
            if (response.ok) {
                return response.json();
            } else if (response.status === 500) {
                const errormessage = 'Could not save this workout.';
                savedTime.textContent = errormessage
                savedTime.style.color = 'red';
                savedMessage.classList.remove('hidden');
                throw new Error(errormessage);
            }
        })
        .then(data => {
            const now = new Date();
            savedTime.textContent = "Workout saved at " + now.toLocaleString();
            savedMessage.classList.remove('hidden');
            savedTime.style.color = 'green';
            console.log('Saved workout-data to the database:', data);
        })
        .catch(error => {
            console.error('Error:', error);
        });
}


export function createAccount() {
    const newUsername = document.getElementById('newUsername').value;
    const newPassword = document.getElementById('newPassword').value;
    const retypePassword = document.getElementById('retypePassword').value;
    const fitnessGoal = document.getElementById('fitnessGoal').value;

    if (newPassword !== retypePassword) {
        alert("Passwords do not match");
        return;
    }

    const credentials = {
        'username': newUsername,
        'password': newPassword,
        'fitnessGoal': fitnessGoal
    };

    fetch(SERVER_ADDRESS + '/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials),
        })
        .then(response => response.status)
        .then(data => {
            showLogin(); // Show the login form after successful account creation
        })
        .catch(error => {
            console.error('Error:', error);
        });
}