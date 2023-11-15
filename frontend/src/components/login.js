import { removeAllTabs } from './tabs.js'
import { getTabs } from './tabs.js'
import { showMessage } from './misc.js';
import { SERVER_ADDRESS } from '../constants.js';

export function showLogin() {
    document.getElementById('loginForm').classList.remove('hidden');
    document.getElementById('createAccountForm').classList.add('hidden');
    showMessage('Type in your username and password.')
}

export function showCreateAccount() {
    document.getElementById('loginForm').classList.add('hidden');
    document.getElementById('createAccountForm').classList.remove('hidden');
    showMessage('Create a new account.')
}

export function loginCancelButtonPressed() {
    document.getElementById('loginForm').classList.add('hidden');
    document.getElementById('loginOptions').classList.remove('hidden');
    document.getElementById('CreateTabFormDiv').classList.add('hidden');
    showMessage('')
}

export function createAccountCancelButtonPressed() {
    document.getElementById('createAccountForm').classList.add('hidden');
    document.getElementById('CreateTabFormDiv').classList.add('hidden');
    showMessage('')
}


export function login() {
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
        }).then(response => {
            if (response.status === 200) {
                showMessage('Login was succesful!');
                return response.json();
            } else {
                showMessage('Failed to login', 'red');
            }
        }).then(token => {
            localStorage.setItem('token', token.token);
            localStorage.setItem('username', credentials.username);
            localStorage.setItem('workoutData', JSON.stringify([]));
            handleLoginSuccess(credentials.username);
        }).catch(error => {
            console.error('Error:', error);
        });
}

export function showNotLoggedIn() {
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

    // Lets remove the workout screen
    document.getElementById('UIboard').classList.add('hidden');

    removeAllTabs();    //  Remove all tabs from the workout page.
}

export async function handleLoginSuccess(username) {
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

    // Lets show the workout screen
    document.getElementById('UIboard').classList.remove('hidden');

    // Clear the content of the forms
    loginForm.reset();
    createAccountForm.reset();

    getTabs();
}

export async function logout() {
    // Get the username for the logout request
    const username = localStorage.getItem('username');

    // Erase token from the server
    await fetch(SERVER_ADDRESS + '/users/logout', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ 'username': username }),
    }).then(response => {
        if (response.status === 200) {
            console.log('Logout was succesful!');
            showNotLoggedIn();
            showMessage('Logged out.');
        } else {
            throw new Error();
        }
    }).catch(() => {
        const failureText = 'Failed to logout on server-side, please refresh the page.';
        console.log(failureText);
        showMessage(failureText);
    });

    // Show login and create account options
    const loginOptions = document.getElementById('loginOptions');
    loginOptions.classList.remove('hidden');
    document.getElementById('latestWorkout').value = '';

    // Erase localstorage
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('selectedTab');
    localStorage.removeItem('workoutData');
}