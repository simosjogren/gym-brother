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
        const errormessage = 'Username too short. Minimum length: ' + MIN_USERNAME_LENGTH;
        return [false, errormessage];
    }
    if (username.length > MAX_USERNAME_LENGTH) {
        const errormessage = 'Username too long. Maximum length: ' + MAX_USERNAME_LENGTH;
        return [false, errormessage];
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
        const errormessage = 'Password too short. Minimum length: ' + MIN_PASSWORD_LENGTH;
        return [false, errormessage];
    }
    if (password.length > MAX_PASSWORD_LENGTH) {
        const errormessage = 'Password too long. Maximum length: ' + MAX_PASSWORD_LENGTH;
        return [false, errormessage];
    }
    if (password !== retypePassword) {
        const errormessage = "Passwords do not match";
        return [false, errormessage];
    }
    return [true, 'Credentials are potential and OK.'];;
}