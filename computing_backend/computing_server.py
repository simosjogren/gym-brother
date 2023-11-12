# Import necessary libraries
from flask import Flask, request, jsonify

app = Flask(__name__)

MUSCLEGAIN_INCREASES = {
    'rep_low': 6,
    'rep_high': 12,
    'rep_upstep': 2,
    'rep_downstep': 2,
    'weight_upstep': 5,
    'weight_downstep': 2.5
}

def manual_upgrade_muscle_gain(old_exercises):
    full_old_exercises = old_exercises.copy()
    old_exercises = old_exercises['exercises']
    new_exercises = []

    for n in range(len(old_exercises)):
        old_exercise = old_exercises[n]
        old_reps = list(map(int, old_exercise['reps']))
        old_reps_len = len(old_reps)
        old_weight = float(old_exercise['weights'])

        new_weight = old_weight
        new_reps = old_reps

        old_rep_max = max(old_reps)
        old_rep_min = min(old_reps)

        biggest_value = old_rep_max
        delaystep = 0

        if old_rep_max >= MUSCLEGAIN_INCREASES['rep_high']:
            new_weight += MUSCLEGAIN_INCREASES['weight_upstep']
            biggest_value = MUSCLEGAIN_INCREASES['rep_high']
            delaystep = 1
        elif old_rep_max < MUSCLEGAIN_INCREASES['rep_low']:
            new_weight -= MUSCLEGAIN_INCREASES['weight_downstep']
            biggest_value = MUSCLEGAIN_INCREASES['rep_high']
            delaystep = 0
        else:
            new_weight = old_weight
            biggest_value = old_rep_max
            delaystep = -1

        for i in range(old_reps_len):
            reps_candidate = biggest_value - (i + delaystep) * MUSCLEGAIN_INCREASES['rep_downstep']
            new_reps[i] = max(reps_candidate, MUSCLEGAIN_INCREASES['rep_low'])

        old_exercise['weights'] = new_weight
        old_exercise['reps'] = new_reps
        new_exercises.append(old_exercise)

    full_old_exercises['exercises'] = new_exercises
    return full_old_exercises

def manual_upgrade(old_exercises):
    return manual_upgrade_muscle_gain(old_exercises)


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
            new_workout = manual_upgrade(item)
            newWorkouts.append(new_workout)
        else:
            newWorkouts.append(item)
    return jsonify({'username': username, 'latestWorkouts': newWorkouts})

if __name__ == '__main__':
    app.run(debug=True)
