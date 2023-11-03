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

function handleLoginSuccess(username) {
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

    getWorkout();   // Lets update the workout to the screen.
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
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
        getWorkout();

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
                username: localStorage.getItem('username'), 
                exerciseClass: localStorage.getItem('selectedTab')
            }),
        })
        .then(response => response.json())
        .then(data => {
            // Lets update the textbox accordinly:
            document.getElementById('latestWorkout').value = data;
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
    const workoutTextarea = document.getElementById('latestWorkout');
    const savedMessage = document.getElementById('workoutSavedMessage');
    const savedTime = document.getElementById('savedTime');
    const exerciseClass = localStorage.getItem('selectedTab');

    const data = {
        username: localStorage.getItem('username'),
        latestWorkout: workoutTextarea.value,
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

document.getElementById('workoutForm').addEventListener('submit', function(event) {
    event.preventDefault();
    postWorkout();
});
