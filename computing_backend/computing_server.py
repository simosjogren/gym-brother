# Python backend of calculating the workout plan.
# Workoutplan is calculated manually, but there is also an option for a
# machine learning algorithm to calculate the workout plan.

# Simo Sjögren

# Import necessary libraries
from flask import Flask, request, jsonify

# Import modules
from tools.manualUpgrade import manual_upgrade

app = Flask(__name__)


@app.route('/manual_upgrade', methods=['POST'])
def manual_upgrade_route():
    # Get the JSON data from the request
    data = request.get_json()
    username = data['username']
    latestWorkouts = data['latestWorkouts']
    exerciseClass = data['exerciseClass']
    newWorkouts = []
    for item in latestWorkouts:
        if item['exerciseClass'] == exerciseClass:
            new_workout = manual_upgrade(item, 'muscleGain')
            newWorkouts.append(new_workout)
        else:
            newWorkouts.append(item)
    return jsonify({'username': username, 'latestWorkouts': newWorkouts})

if __name__ == '__main__':
    app.run(debug=True)
