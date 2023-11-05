import { displayableFormatConverter } from '../utils/displayableFormatConverter.js';
import { getWorkout } from '../utils/api.js';
import { SERVER_ADDRESS } from '../constants.js';

export function createTabItem(tabname) {
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


export function tapPressed(tabName) {
    localStorage.setItem('selectedTab', tabName);
    const exerciseClass = localStorage.getItem('selectedTab');
    const data = JSON.parse(localStorage.getItem('workoutData'));
    const displayableString = displayableFormatConverter(data, exerciseClass);
    document.getElementById('latestWorkout').value = displayableString;
}


export function removeAllTabs() {
    var myWorkoutTabs = document.getElementById('myWorkoutTabs');
    while (myWorkoutTabs.firstChild) {
        myWorkoutTabs.removeChild(myWorkoutTabs.firstChild);
    }
}


export async function getTabs() {
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    await fetch(`${SERVER_ADDRESS}/get-tabs?username=${username}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    }).then(response => response.json()).then(data => {
        for (let n = 0; n < data.length; n++) {
            createTabItem(data[n]);
        }
        localStorage.setItem('selectedTab', data[0]);
        getWorkout();   // Lets update the workout to the screen.
    });
}


export async function createNewTabFromScratch() {
    const newValue = document.getElementById('newTabName').value;
    console.log('Creating new tab for ' + newValue + '.')

    createTabItem(newValue);
    let data = {newTabName: newValue, username: localStorage.getItem('username')};

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
    })
}