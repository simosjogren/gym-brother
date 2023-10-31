const SERVER_ADDRESS = 'http://localhost:3000';
let typingTimer;

function showLogin() {
    document.getElementById('loginForm').classList.remove('hidden');
    document.getElementById('createAccountForm').classList.add('hidden');
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
}

function showCreateAccount() {
    document.getElementById('loginForm').classList.add('hidden');
    document.getElementById('createAccountForm').classList.remove('hidden');
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
    // Hide login options

    const loginOptions = document.getElementById('loginOptions');
    loginOptions.classList.add('hidden');

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

    if (newPassword !== retypePassword) {
        alert("Passwords do not match");
        return;
    }

    const credentials = {
        'username': newUsername,
        'password': newPassword
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
            if (data) {
                // Lets update the textbox accordinly:
                document.getElementById('latestWorkout').value = data;
            } else {
                console.log('Did not find any workout data for the user.')
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

function postWorkout() {
    const workoutTextarea = document.getElementById('latestWorkout');
    const savedMessage = document.getElementById('workoutSavedMessage');
    const savedTime = document.getElementById('savedTime');

    const data = {
        username: localStorage.getItem('username'),
        fitnessGoal: 'weightLoss',
        latestWorkout: workoutTextarea.value
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
            } else {
                throw new Error('Network response was not ok');
            }
        })
        .then(data => {
            const now = new Date();
            savedTime.textContent = now.toLocaleString();
            savedMessage.classList.remove('hidden');
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
