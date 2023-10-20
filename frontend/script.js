// Frontend scripts for the gym-bro
// Simo Sjögren

const SERVER_ADDRESS = 'http://localhost:3000';
let typingTimer;

const userData = {
    'user-id': '123testid99',
}

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
    // With this function, we post the current workout to the database.

    const data = {
        fitnessGoal: 'weightLoss',
        latestWorkout: document.getElementById('latestWorkout').value
    };
    
    fetch(SERVER_ADDRESS + '/post-workout', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
    .then(response => response.json())
    .then(data => {
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
