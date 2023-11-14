import { displayableFormatConverter } from './displayableFormatConverter.js';
import { inputParser } from './inputParser.js';
import { showMessage, checkCredentialValidity } from '../components/misc.js';
import { createAccountCancelButtonPressed } from '../components/login.js';
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

            // If we get a non-empty string back, we can enable the updateWorkout.
            if (displayableString !== '') {
                document.getElementById('updateWorkout').disabled = false;
            } else {
                document.getElementById('updateWorkout').disabled = true;
            }
            document.getElementById('latestWorkout').value = displayableString;
        })
        .catch(error => {
            console.error('Error:', error);
        });
}


export function postWorkout() {
    const exerciseClass = localStorage.getItem('selectedTab');
    let latestWorkout = localStorage.getItem('workoutData');
    if (latestWorkout === null) {
        console.log('No workout data found. Creating new workout data.');
        latestWorkout = [];
    } else {
        latestWorkout = JSON.parse(latestWorkout);
    }

    // Here we do the local browser saving process.
    const currentTabWorkout = document.getElementById('latestWorkout').value;
    const parsedWorkout = inputParser(currentTabWorkout, exerciseClass);

    // Lets add new workouts to the one going to database ONLY if they are not already there.
    for (let n = 0; n < parsedWorkout.length; n++) {
        const exerciseNameToCompare = parsedWorkout[n].exerciseName;
        if (!latestWorkout.some(item => item.exerciseName === exerciseNameToCompare)) {
            latestWorkout.push(parsedWorkout[n]);
        }
    }

    const parsedWorkoutNames = parsedWorkout.map(item => item.exerciseName);
    // We assume that parsedWorkout are the same class everything
    const parsedWorkoutClass = parsedWorkout[0].exerciseClass;

    // Lets check which ones are removed from the new one
    for (let k = 0; k < latestWorkout.length; k++) {
        const foundIndex = parsedWorkoutNames.indexOf(latestWorkout[k].exerciseName);
        // This means that the item is removed from the frontend-side.
        if (foundIndex === -1) {
            if (latestWorkout[k].exerciseClass === parsedWorkoutClass) {
                console.log('Line removed from the frontend: ', latestWorkout[k]);
                latestWorkout.splice(latestWorkout, 1);
            }
        }
    }
    
    const latestWorkout_str = JSON.stringify(latestWorkout);

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
            showMessage('Could not send workout to server. Fix the form.', 'red');
            throw new Error(errormessage);
        }
    })
    .then(data => {
        const now = new Date();
        localStorage.setItem('workoutData', JSON.stringify(data));
        showMessage("Workout saved at " + now.toLocaleString());
        document.getElementById('updateWorkout').disabled = false;
        console.log('Saved workout-data to the database:', data);
    })
    .catch(error => {
        console.error('Error:', error);
    });
}


export function createAccount() {
    // Picking the values from UI
    const newUsername = document.getElementById('newUsername').value;
    const newPassword = document.getElementById('newPassword').value;
    const retypePassword = document.getElementById('retypePassword').value;
    const fitnessGoal = document.getElementById('fitnessGoal').value;

    // Checking the validity of the values
    const [validity, errormessage] = checkCredentialValidity(newUsername, newPassword, retypePassword);
    if (!validity) {
        showMessage(errormessage, 'red');
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
        .then((status) => {
            if (status === 201) {
                // We want to close the create account bar after succesful login.
                createAccountCancelButtonPressed();
                showMessage('Account successfully created!');
            }
            if (status === 409) {
                showMessage('Username already exists', 'red');
            }
            if (status === 500) {
                showMessage('Unknown error with the server...', 'red');
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

export async function upgradeWorkout() {
    const exerciseClass = localStorage.getItem('selectedTab');
    const latestWorkout = JSON.parse(localStorage.getItem('workoutData'));

    // Next, lets check if there is somekind of line without id.
    // If there is, we need to 'synchronize' the values from the database
    const hasObjectWithoutId = latestWorkout.some(obj => !obj.hasOwnProperty('id'));
    if (hasObjectWithoutId) {
        getWorkout();
    }

    const data = {
        username: localStorage.getItem('username'),
        latestWorkout: latestWorkout,
        exerciseClass: exerciseClass
    };

    const token = localStorage.getItem('token');

    try {
        const response = await fetch(SERVER_ADDRESS + '/upgrade-workout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data),
        });

        if (response.ok) {
            let responseData = await response.json();
            responseData = responseData['new_workouts'];
            console.log(responseData);
            const displayableString = displayableFormatConverter(responseData, exerciseClass);
            document.getElementById('latestWorkout').value = displayableString;
            localStorage.setItem('workoutData', JSON.stringify(responseData));
        } else {
            console.error('Error:', response.statusText);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}