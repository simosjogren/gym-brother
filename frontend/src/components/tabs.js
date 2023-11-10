import { displayableFormatConverter } from '../utils/displayableFormatConverter.js';
import { getWorkout } from '../utils/api.js';
import { SERVER_ADDRESS } from '../constants.js';
import { showMessage } from './misc.js';

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

    // Now we want to allow the workoutwriting, because we have the first tab.
    document.getElementById('latestWorkout').disabled = false;

    // Return the generated button element in case you want to further manipulate it
    return newButtonElement;
}


export function tapPressed(tabName) {
    localStorage.setItem('selectedTab', tabName);
    const exerciseClass = localStorage.getItem('selectedTab');
    const data = JSON.parse(localStorage.getItem('workoutData'));
    let displayableString = '';
    if (data !== undefined) {
        displayableString = displayableFormatConverter(data, exerciseClass);
    }
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
    const response = await fetch(`${SERVER_ADDRESS}/get-tabs?username=${username}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });
    if (response.status === 200) {
        const data = await response.json();
        if (data) {
            let loop_length = data.length;
            for (let n = 0; n < loop_length; n++) {
                createTabItem(data[n]);
            }
            if (loop_length !== 0) {
                localStorage.setItem('selectedTab', data[0]);
                document.getElementById(data[0]+'-tab').classList.add('active');
                getWorkout();
            }
        } else {
            showMessage('Data is undefined.');
        }
    } else if (response.status === 204) {
        showMessage('You need to create a tab first.');
    }
}


export async function createNewTabFromScratch() {
    const newValue = document.getElementById('newTabName').value;
    createTabItem(newValue);
    let data = {newTabName: newValue, username: localStorage.getItem('username')};
        if (localStorage.getItem('selectedTab') === null) {
            document.getElementById(newValue + '-tab').classList.add('active');
            showMessage('Created a first tab.');
        } else {
            showMessage('Created a new tab.');
        }
    localStorage.setItem('selectedTab', newValue);

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