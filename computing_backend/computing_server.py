# Computing backend for handling all the computing requests from the client.
# This is the main server file that will be run on the server.
# Author: Simo Sjögren

from flask import Flask, request, jsonify
from tools.inputParsingTools import basicStringHandling, weightHandling, repsHandling

app = Flask(__name__)

def input_parser(workouts_in_string):

    try:
        workoutlist_final = []

        # Row splitting
        workoutlist_raw = workouts_in_string.split('\n')
        
        # We perform same operations for each workout
        for workoutstring in workoutlist_raw:

            # TODO inspection if there are multiple weights used in the exercise
            
            # Basic string handling
            exerciseName, exerciseData_raw = basicStringHandling(workoutstring)
            if exerciseName == False:
                continue    # Skip empty rows

            # Weight handling
            weights, both_sides = weightHandling(exerciseData_raw)
            
            # Reps handling
            reps = repsHandling(exerciseData_raw)

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

            # Add it into the all workouts list
            workoutlist_final.append(parsedData)

        return workoutlist_final
    except:
        return []


@app.route('/parse-input', methods=['POST'])
def parse_input():
    try:
        # Get the JSON data from the request
        data = request.get_json()

        # Get the string from the JSON object
        workoutstring = data["workoutString"]
        parsedData = input_parser(workoutstring)
        if parsedData == []:
            print('Handling the string failed.')
            return jsonify({"error": "Invalid input"}), 500
        else:
            # Return the latest workout
            print('Returning the parsed data.')
            print(parsedData)
            return jsonify({"training": parsedData}), 200
    except:
        return jsonify({"error": "Invalid input"}), 500



if __name__ == '__main__':
    app.run(debug=True)

