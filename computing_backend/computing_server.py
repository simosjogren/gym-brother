# Computing backend for handling all the computing requests from the client.
# This is the main server file that will be run on the server.
# Author: Simo Sjögren

from flask import Flask, request, jsonify

app = Flask(__name__)

def input_parser(workoutstring):

    # TODO outer loop for /n marks
    # TODO inspection if there are multiple weights used in the exercise
    
    workoutstring = workoutstring.replace(" ", "")
    strippedString = workoutstring.split(":")
    exerciseName = strippedString[0]
    exerciseData_string = strippedString[1]
    exerciseData_raw = exerciseData_string.split(",")
    print(exerciseData_raw)

    # Weight handling
    weights = exerciseData_raw[0]
    both_sides = False  # Default value
    # If weights are in the format 80+80, we need to split them
    if ('+' in weights):
        weights = weights.split("+")[0]
        weights = float(weights)
        both_sides = True
    
    # Reps handling
    reps_str = exerciseData_raw[1]
    reps = reps_str.split("/")
    print(reps)
    for i in range(len(reps)):
        reps[i] = int(reps[i])

    # Comment handling
    try: 
        comment = exerciseData_raw[2]
    except IndexError:
        comment = ""

    # Create the JSON object
    parsedData = {
        "exerciseName": exerciseName,
        "exercises": [{
            "weights": weights,
            "both_sides": both_sides,
            "reps": reps
        }],
        "comment": comment
    }
    return parsedData


@app.route('/parse-input', methods=['POST'])
def parse_input():
    # Get the JSON data from the request
    data = request.get_json()

    # Get the string from the JSON object
    workoutstring = data["workoutString"]
    parsedData = input_parser(workoutstring)

    print(parsedData)
    return jsonify(parsedData)


if __name__ == '__main__':
    app.run(debug=True)

