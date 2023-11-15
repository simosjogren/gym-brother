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
        const exerciseClass = localStorage.getItem('selectedTab');
        const displayableString = displayableFormatConverter(data, exerciseClass);

        if (displayableString !== '') {
            document.getElementById('updateWorkout').disabled = false;
        } else {
            document.getElementById('updateWorkout').disabled = true;
        }
        document.getElementById('latestWorkout').value = displayableString;
    })
    .catch(error => {
        showMessage(`${error.message}`, 'red');
        console.error('Error:', error);
    });
}

export function postWorkout() {
    try {
        const exerciseClass = localStorage.getItem('selectedTab');
        let latestWorkout = localStorage.getItem('workoutData');
        if (latestWorkout === null) {
            console.log('No workout data found. Creating new workout data.');
            latestWorkout = [];
        } else {
            latestWorkout = JSON.parse(latestWorkout);
        }

        const currentTabWorkout = document.getElementById('latestWorkout').value;
        const parsedWorkout = inputParser(currentTabWorkout, exerciseClass);

        for (let n = 0; n < parsedWorkout.length; n++) {
            const exerciseNameToCompare = parsedWorkout[n].exerciseName;
            if (!latestWorkout.some(item => item.exerciseName === exerciseNameToCompare)) {
                latestWorkout.push(parsedWorkout[n]);
            }
        }

        const parsedWorkoutNames = parsedWorkout.map(item => item.exerciseName);
        const parsedWorkoutClass = parsedWorkout[0].exerciseClass;

        for (let k = 0; k < latestWorkout.length; k++) {
            const foundIndex = parsedWorkoutNames.indexOf(latestWorkout[k].exerciseName);
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
                throw new Error(`Server error: ${response.statusText}`);
            }
        })
        .then(data => {
            const now = new Date();
            localStorage.setItem('workoutData', JSON.stringify(data));
            showMessage(`Workout saved at ${now.toLocaleString()}`);
            document.getElementById('updateWorkout').disabled = false;
            console.log('Saved workout-data to the database:', data);
        })
        .catch(error => {
            showMessage(`${error.message}`, 'red');
            console.error('Error:', error);
        });
    } catch (error) {
        showMessage(`${error.message}`, 'red');
        console.error('Error:', error);
    }
}

export function createAccount() {
    try {
        const newUsername = document.getElementById('newUsername').value;
        const newPassword = document.getElementById('newPassword').value;
        const retypePassword = document.getElementById('retypePassword').value;
        const fitnessGoal = document.getElementById('fitnessGoal').value;

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
                createAccountCancelButtonPressed();
                showMessage('Account successfully created!');
            }
            if (status === 409) {
                throw new Error('Username already exists');
            }
            if (status === 500) {
                throw new Error('Unknown error with the server...');
            }
        })
        .catch(error => {
            showMessage(`${error.message}`, 'red');
            console.error('Error:', error);
        });
    } catch (error) {
        showMessage(`${error.message}`, 'red');
        console.error('Error:', error);
    }
}

export async function upgradeWorkout() {
    try {
        const exerciseClass = localStorage.getItem('selectedTab');
        const latestWorkout = JSON.parse(localStorage.getItem('workoutData'));

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
            throw new Error(`Server error: ${response.statusText}`);
        }
    } catch (error) {
        showMessage(`${error.message}`, 'red');
        console.error('Error:', error);
    }
}
