let typingTimer;

import { getWorkout, postWorkout, createAccount, upgradeWorkout } from './utils/api.js';
import { removeAllTabs, createTabItem, tapPressed, createNewTabFromScratch } from './components/tabs.js';
import { showNotLoggedIn, login, logout, handleLoginSuccess, 
    showCreateAccount, showLogin, loginCancelButtonPressed, createAccountCancelButtonPressed } from './components/login.js';
import { inputParser } from './utils/inputParser.js';
import { showMessage } from './components/misc.js';


// Turning the onclick actions on.
document.querySelector('#logoutButton').addEventListener('click', logout)
document.querySelector('#loginButton').addEventListener('click', showLogin)
document.querySelector('#createAccountButton').addEventListener('click', showCreateAccount)
document.querySelector('#createTabButton').addEventListener('click', createNewTabFromScratch)
document.querySelector('#updateWorkout').addEventListener('click', upgradeWorkout)

document.querySelector('#loginCancelButton').addEventListener('click', function(event) {
    event.preventDefault(); // Prevent the form from being submitted
    loginCancelButtonPressed();
});
document.querySelector('#createAccountCancelButton').addEventListener('click', function(event) {
    event.preventDefault(); // Prevent the form from being submitted
    createAccountCancelButtonPressed();
});
document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault();
    login();
});
document.getElementById('createAccountForm').addEventListener('submit', function(event) {
    event.preventDefault();
    createAccount();
});

window.onload = function() {
    const username = localStorage.getItem('username');
    if (username) {
        handleLoginSuccess(username);
    } else {
        showNotLoggedIn();
    }
};


document.getElementById('latestWorkout').addEventListener('input', function() {
    clearTimeout(typingTimer);
    typingTimer = setTimeout(postWorkout, 2000);
    document.getElementById('updateWorkout').disabled = true;
});


document.addEventListener('DOMContentLoaded', function() {
    showMessage('');
    var myWorkoutTabs = document.getElementById('myWorkoutTabs');
    myWorkoutTabs.addEventListener('click', function(event) {
        if (event.target && event.target.matches('button.nav-link')) {
            var tabName = event.target.textContent;
            tapPressed(tabName);
        }
    });
});