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

function showNotLoggedIn() {
    const loggedInBar = document.getElementById('loggedInBar');
    loggedInBar.classList.remove('hidden');
    const loggedInUsername = document.getElementById('loggedInUsername');
    loggedInUsername.textContent = "Not Logged In";
    const logoutButton = document.getElementById('logoutButton');
    logoutButton.classList.add('hidden');
}

function showCreateAccount() {
    document.getElementById('loginForm').classList.add('hidden');
    document.getElementById('createAccountForm').classList.remove('hidden');
}

function handleLoginSuccess(username) {
    const loggedInBar = document.getElementById('loggedInBar');
    const loggedInUsername = document.getElementById('loggedInUsername');
    loggedInUsername.textContent = username;
    loggedInBar.classList.remove('hidden');
    const logoutButton = document.getElementById('logoutButton');
    logoutButton.classList.remove('hidden'); // Show logout button on successful login
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    showNotLoggedIn();
    document.getElementById('loginOptions').classList.remove('hidden');
}

window.onload = function() {
    const username = localStorage.getItem('username');
    if (username) {
        handleLoginSuccess(username);
    } else {
        showNotLoggedIn();
    }
};

window.onload = function() {
    const username = localStorage.getItem('username');
    if (username) {
        handleLoginSuccess(username);
    } else {
        showNotLoggedIn(); // If not logged in, show "Not Logged In"
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
        handleLoginSuccess(credentials.username);
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
    const data = {
        username: localStorage.getItem('username'),
    };

    const token = localStorage.getItem('token');
    
    fetch(SERVER_ADDRESS + '/get-workout', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data),
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
