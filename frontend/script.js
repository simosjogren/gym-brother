const SERVER_ADDRESS = 'http://localhost:3000';
let typingTimer;

function showLogin() {
    document.getElementById('loginForm').classList.remove('hidden');
    document.getElementById('createAccountForm').classList.add('hidden');
}

function showCreateAccount() {
    document.getElementById('loginForm').classList.add('hidden');
    document.getElementById('createAccountForm').classList.remove('hidden');
}

function showNotLoggedIn() {
    const loggedInBar = document.getElementById('loggedInBar');
    loggedInBar.classList.remove('hidden');
    const loggedInMessage = document.getElementById('loggedInMessage');
    loggedInMessage.textContent = "Not Logged In";
    const logoutButton = document.getElementById('logoutButton');
    logoutButton.classList.add('hidden');

    // Show login and create account options
    const loginOptions = document.getElementById('loginOptions');
    loginOptions.classList.remove('hidden');

    document.getElementById('latestWorkout').disabled = true;
    document.getElementById('CreateTabFormDiv').classList.add('hidden');

    removeAllTabs();    //  Remove all tabs from the workout page.
}

async function handleLoginSuccess(username) {
    const loggedInBar = document.getElementById('loggedInBar');
    const loggedInMessage = document.getElementById('loggedInMessage');
    loggedInMessage.textContent = "Welcome, " + username;
    loggedInBar.classList.remove('hidden');
    const logoutButton = document.getElementById('logoutButton');
    logoutButton.classList.remove('hidden'); // Show logout button on successful login

    // Hide login and create account forms and buttons
    const loginForm = document.getElementById('loginForm');
    const createAccountForm = document.getElementById('createAccountForm');
    loginForm.classList.add('hidden');
    createAccountForm.classList.add('hidden');

    document.getElementById('loginOptions').classList.add('hidden');
    document.getElementById('CreateTabFormDiv').classList.remove('hidden');

    // Clear the content of the forms
    loginForm.reset();
    createAccountForm.reset();

    document.getElementById('latestWorkout').disabled = false;

    const token = localStorage.getItem('token');
    await fetch(`${SERVER_ADDRESS}/get-tabs?username=${username}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    }).then(response => response.json()).then(data => {
        for (let n = 0; n < data.length; n++) {
            createTabItem(data[n]);
        }
        localStorage.setItem('selectedTab', data[0]);
        getWorkout();   // Lets update the workout to the screen.
    });
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('selectedTab');
    localStorage.removeItem('workoutData');
    showNotLoggedIn();

    // Show login and create account options
    const loginOptions = document.getElementById('loginOptions');
    loginOptions.classList.remove('hidden');
    document.getElementById('latestWorkout').value = '';
}

window.onload = function() {
    const username = localStorage.getItem('username');
    if (username) {
        handleLoginSuccess(username);
    } else {
        showNotLoggedIn();
    }
};

document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const credentials = {
        'username': username,
        'password': password
    };

    fetch(SERVER_ADDRESS + '/users/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials),
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to log in');
            } else {
                return response.json();
            }
        })
        .then(token => {
            localStorage.setItem('token', token.token);
            localStorage.setItem('username', credentials.username);
            handleLoginSuccess(credentials.username);
        })
        .catch(error => {
            console.error('Error:', error);
        });
});

document.getElementById('createAccountForm').addEventListener('submit', function(event) {
    event.preventDefault();
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
            console.log(data);
            showLogin(); // Show the login form after successful account creation
        })
        .catch(error => {
            console.error('Error:', error);
        });
});

document.getElementById('latestWorkout').addEventListener('input', function() {
    clearTimeout(typingTimer);
    typingTimer = setTimeout(postWorkout, 2000);
});

function createTabItem(tabname) {
    // Assuming you have an existing ul element with the id "myWorkoutTabs"
    var myWorkoutTabs = document.getElementById('myWorkoutTabs');

    // Create a new li element
    var newLiElement = document.createElement('li');
    newLiElement.className = 'nav-item';
    newLiElement.setAttribute('role', 'presentation');

    // Create a new button element
    var newButtonElement = document.createElement('button');
    newButtonElement.className = 'nav-link';
    newButtonElement.id = tabname + '-tab'; // Use tabname to generate unique IDs
    newButtonElement.setAttribute('data-bs-toggle', 'tab');
    newButtonElement.setAttribute('data-bs-target', '#' + tabname); // Use tabname to link to the corresponding tab content
    newButtonElement.setAttribute('type', 'button');
    newButtonElement.setAttribute('role', 'tab');
    newButtonElement.setAttribute('aria-controls', tabname); // Use tabname for accessibility
    newButtonElement.textContent = tabname;

    // Append the button to the li element
    newLiElement.appendChild(newButtonElement);

    // Append the li element to the ul
    myWorkoutTabs.appendChild(newLiElement);

    // Return the generated button element in case you want to further manipulate it
    return newButtonElement;
}

async function createNewTabFromScratch() {
    const newValue = document.getElementById('newTabName').value;
    console.log('Creating new tab for ' + newValue + '.')

    createTabItem(newValue);
    data = {newTabName: newValue, username: localStorage.getItem('username')};

    const token = localStorage.getItem('token');
    await fetch(SERVER_ADDRESS + '/create-tab', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data),
    }).then(response => {
        response = response.json()
        console.log(response);
    })
}

document.addEventListener('DOMContentLoaded', function() {
    var myWorkoutTabs = document.getElementById('myWorkoutTabs');

    myWorkoutTabs.addEventListener('click', function(event) {
        if (event.target && event.target.matches('button.nav-link')) {
            var tabName = event.target.textContent;
            tapPressed(tabName);
        }
    });

    function tapPressed(tabName) {
        // Save the title of the tab in localStorage
        localStorage.setItem('selectedTab', tabName);
        console.log('Tab pressed:', tabName);
        const exerciseClass = localStorage.getItem('selectedTab');
        const data = JSON.parse(localStorage.getItem('workoutData'));
        console.log('DATA: ', data)
        const displayableString = displayableFormatConverter(data, exerciseClass);
        document.getElementById('latestWorkout').value = displayableString;
    }
});


function getWorkout() {
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

function removeAllTabs() {
    var myWorkoutTabs = document.getElementById('myWorkoutTabs');
    while (myWorkoutTabs.firstChild) {
        myWorkoutTabs.removeChild(myWorkoutTabs.firstChild);
    }
}

function postWorkout() {
    const savedMessage = document.getElementById('workoutSavedMessage');
    const savedTime = document.getElementById('savedTime');
    const exerciseClass = localStorage.getItem('selectedTab');
    const latestWorkout = JSON.parse(localStorage.getItem('workoutData'));
    console.log('Latest workouts: ', latestWorkout);

    // Here we do the local browser saving process.
    const currentTabWorkout = document.getElementById('latestWorkout').value;
    const parsedWorkout = inputParser(currentTabWorkout, exerciseClass);
    console.log('Parsed workout length: ', parsedWorkout.length);
    let latestWorkout_str = '';
    for (let n=0; n < parsedWorkout.length; n++) {
        console.log('parsedWorkout: ', parsedWorkout[n]);
        if (latestWorkout.includes(parsedWorkout[n])) {
            console.log('Found duplicate, skipping.');
            continue;
        } else {
            console.log('Found new exercise, adding.')
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

function displayableFormatConverter(exerciseList, exerciseClass) {
    // We convert the JSON received from python backend into a displayable format in JS.
        let displayableString = "";
        console.log('Exercise List: ', exerciseList);
        console.log('Exercise Class: ', exerciseClass);
        for (let n = 0; n < exerciseList.length; n++) {
            if (exerciseList[n].exerciseClass !== exerciseClass) {
                continue;
            }
            displayableString += exerciseList[n].exerciseName + ": ";
            const current_exercise = exerciseList[n].exercises;
            for (let i = 0; i < current_exercise.length; i++) {
                console.log('EXERCISE:', current_exercise[i])    
                if (current_exercise[i].both_sides) {
                    displayableString += current_exercise[i].weights + '+' + current_exercise[i].weights;
                } else {
                    displayableString += current_exercise[i].weights;
                }
                displayableString += ', ';
                displayableString += current_exercise[i].reps[0];
                for (let m = 1; m < current_exercise[i].reps.length; m++) {
                    displayableString += '/';
                    displayableString += current_exercise[i].reps[m];
                }
                if (current_exercise[i].comments !== "") {
                    displayableString += ', ';
                    displayableString += exerciseList[n].comments;
                }
            }
            displayableString += '\n';
        }
        console.log('returning this: ', displayableString);
        return displayableString;
}



function inputParser(workouts_in_string, exerciseClass) {
    try {
        const workoutlist_final = [];

        // Row splitting
        const workoutlist_raw = workouts_in_string.split('\n');

        // We perform same operations for each workout
        workoutlist_raw.forEach(workoutstring => {
            // TODO inspection if there are multiple weights used in the exercise

            // Basic string handling
            const { exerciseName, exerciseData_raw } = basicStringHandling(workoutstring);
            if (!exerciseName) {
                return; // Skip empty rows
            }

            // Weight handling
            const { weights, both_sides } = weightHandling(exerciseData_raw);

            // Reps handling
            const reps = repsHandling(exerciseData_raw);

            // Comment handling
            const comments = exerciseData_raw[2] || "";

            // Create the JSON object
            const parsedData = {
                exerciseClass: exerciseClass,
                exerciseName,
                exercises: [{
                    weights,
                    both_sides,
                    reps
                }],
                comments
            };
            // Add it into the all workouts list
            workoutlist_final.push(parsedData);
        });
        return workoutlist_final;
    } catch (error) {
        return [];
    }
}

function basicStringHandling(workoutstring) {
    workoutstring = workoutstring.replace(" ", "");
    if (workoutstring === "") {
        console.log('Found empty row.');
        return [false, false]; // Skip empty rows
    }

    const strippedString = workoutstring.split(":");
    if (strippedString.length === 2 && strippedString[1] === "") {
        return [false, false]; // This means that it is a headliner row, skip it.
    }

    const exerciseName = strippedString[0];
    const exerciseData_string = strippedString[1];
    const exerciseData_raw = exerciseData_string.split(",");
    return { exerciseName, exerciseData_raw };
}

function weightHandling(exerciseData_raw) {
    let weights = exerciseData_raw[0];
    let both_sides = false; // Default value

    // If weights are in the format 80+80, we need to split them
    if (weights.includes('+')) {
        weights = weights.replace(" ", "").split("+")[0];
        weights = parseFloat(weights);
        both_sides = true;
    }

    return { weights, both_sides };
}

function repsHandling(exerciseData_raw) {
    let reps_str = exerciseData_raw[1];
    reps_str = reps_str.replace(" ", "");
    const reps = reps_str.split("/").map(rep => parseInt(rep, 10));
    return reps;
}