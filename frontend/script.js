// Frontend scripts for the gym-bro
// Simo Sjögren

const SERVER_ADDRESS = 'http://localhost:3000';
let typingTimer;

const userData = {
    'username': '123testid99',
}

function showLogin() {
    document.getElementById('loginForm').classList.remove('hidden');
    document.getElementById('createAccountForm').classList.add('hidden');
}

function showCreateAccount() {
    document.getElementById('loginForm').classList.add('hidden');
    document.getElementById('createAccountForm').classList.remove('hidden');
}

// Function to handle login form submission
document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const credentials = {
        'username': username,
        'password': password
    };
    // Time to send the create-account request to the server
    fetch(SERVER_ADDRESS + '/users/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to log in'); // Catch block
        } else {
            return response.json(); // Return the promise
        }
    })
    .then(token => { // Use the resolved token
        console.log('Retrieved token: ' + token.token);
        localStorage.setItem('token', token.token);
        localStorage.setItem('username', credentials.username);
    })
    .catch(error => {
        console.error('Error:', error);
    });
});

// Function to handle create account form submission
document.getElementById('createAccountForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const newUsername = document.getElementById('newUsername').value;
    const newPassword = document.getElementById('newPassword').value;
    const credentials = {
        'username': newUsername,
        'password': newPassword
    };
    // Time to send the create-account request to the server
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
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
    })
    .then(response => response.json())
    .then(data => {
        console.log('Retrieved the new workout from the database:', data);
        document.getElementById('workoutResult').classList.remove('hidden');
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
    .then(response => response.json())
    .then(data => {
        const now = new Date();
        savedTime.textContent = now.toLocaleString();
        savedMessage.classList.remove('hidden');
        console.log('Saved workout-data to the database:', data.latestWorkout);
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

document.getElementById('workoutForm').addEventListener('submit', function(event) {
    event.preventDefault();
    postWorkout();
});
