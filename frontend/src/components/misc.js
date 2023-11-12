import { MIN_USERNAME_LENGTH, MAX_USERNAME_LENGTH, 
    MIN_PASSWORD_LENGTH, MAX_PASSWORD_LENGTH } from '../constants.js';


export function showMessage(message, color='green') {
    const messageContainer = document.getElementById('messageContainer');
    if (messageContainer) {
        messageContainer.textContent = message;
        messageContainer.style.color = color;
    }
}

export function checkCredentialValidity(username, password, retypePassword) {
    if (username.length < MIN_USERNAME_LENGTH) {
        showMessage('Username too short. Minimum length: ' + MIN_USERNAME_LENGTH, 'red');
        return false;
    }
    if (username.length > MAX_USERNAME_LENGTH) {
        showMessage('Username too long. Maximum length: ' + MAX_USERNAME_LENGTH, 'red');
        return false;
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
        showMessage('Password too short. Minimum length: ' + MIN_PASSWORD_LENGTH, 'red');
        return false;
    }
    if (password.length > MAX_PASSWORD_LENGTH) {
        showMessage('Password too long. Maximum length: ' + MAX_PASSWORD_LENGTH, 'red');
        return false;
    }
    if (password !== retypePassword) {
        showMessage("Passwords do not match");
        return false;
    }
    return true;
}