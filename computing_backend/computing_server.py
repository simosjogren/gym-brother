# Computing backend for handling all the computing requests from the client.
# This is the main server file that will be run on the server.
# Author: Simo Sjögren

from flask import Flask, request, jsonify

app = Flask(__name__)

def input_parser(workouts_in_string):

    try:
        workoutlist_raw = workouts_in_string.split('\n')
        workoutlist_final = []

        # We perform same operations for each workout
        for workoutstring in workoutlist_raw:

            # TODO inspection if there are multiple weights used in the exercise
            
            # Basic string handling
            workoutstring = workoutstring.replace(" ", "")
            strippedString = workoutstring.split(":")
            exerciseName = strippedString[0]
            exerciseData_string = strippedString[1]
            exerciseData_raw = exerciseData_string.split(",")

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

