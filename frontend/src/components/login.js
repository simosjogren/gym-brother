import { removeAllTabs } from './tabs.js'
import { getTabs } from './tabs.js'
import { SERVER_ADDRESS } from '../constants.js';

export function showLogin() {
    document.getElementById('loginForm').classList.remove('hidden');
    document.getElementById('createAccountForm').classList.add('hidden');
}

export function showCreateAccount() {
    document.getElementById('loginForm').classList.add('hidden');
    document.getElementById('createAccountForm').classList.remove('hidden');
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

    // Clear the content of the forms
    loginForm.reset();
    createAccountForm.reset();

    document.getElementById('latestWorkout').disabled = false;
    getTabs();
}

export function logout() {
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