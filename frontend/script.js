// Frontend scripts for the gym-bro
// Simo Sjögren

const SERVER_ADDRESS = 'http://localhost:3000'

document.getElementById('workoutForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const workoutResult = document.getElementById('workoutResult'); // Workout idea appears inside here.
    const workoutList = document.getElementById('workoutList');  // Inner list of workoutResult.
    workoutList.innerHTML = '';

    const data = {
        fitnessGoal: 'weightLoss',
        workoutPreferences: 'Focus on upper body and core strength.'
    };
    
    fetch(SERVER_ADDRESS + '/generate-workout', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
    .then(response => response.json())
    .then(data => {
        console.log('Generated Workout Data:', data.workoutData);
    })
    .catch(error => {
        console.error('Error:', error);
    });

    workoutData.forEach(workout => {
        const li = document.createElement('li');
        li.textContent = workout;
        workoutList.appendChild(li);
    });

    workoutResult.classList.remove('hidden');
});
