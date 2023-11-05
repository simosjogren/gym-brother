let typingTimer;

import { getWorkout, postWorkout, createAccount } from './utils/api.js';
import { displayableFormatConverter } from './utils/displayableFormatConverter.js';
import { removeAllTabs, createTabItem, tapPressed, createNewTabFromScratch } from './components/tabs.js';
import { showNotLoggedIn, login, logout, handleLoginSuccess, showCreateAccount, showLogin } from './components/login.js';
import { inputParser } from './utils/inputParser.js';


// Turning the onclick actions on.
document.querySelector('#logoutButton').addEventListener('click', logout)
document.querySelector('#loginButton').addEventListener('click', showLogin)
document.querySelector('#createAccountButton').addEventListener('click', showCreateAccount)
document.querySelector('#createTabButton').addEventListener('click', createNewTabFromScratch)
document.querySelector('#newWorkoutRetrieveButton').addEventListener('click', getWorkout)
// We use event.preventDefault() to prevent the default action of the form (which is to refresh the page)
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
});


document.addEventListener('DOMContentLoaded', function() {
    var myWorkoutTabs = document.getElementById('myWorkoutTabs');
    myWorkoutTabs.addEventListener('click', function(event) {
        if (event.target && event.target.matches('button.nav-link')) {
            var tabName = event.target.textContent;
            tapPressed(tabName);
        }
    });
});