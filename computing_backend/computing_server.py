# Computing backend for handling all the computing requests from the client.
# This is the main server file that will be run on the server.
# Author: Simo Sjögren

from flask import Flask, request, jsonify

app = Flask(__name__)


@app.route('/upgrade-workout', methods=['POST'])
def parse_input():
    try:
        # Get the JSON data from the request
        data = request.get_json()

        # TODO FIX!!!

        # Get the string from the JSON object
        workoutstring = data["workoutString"]
        parsedData = [] # DUMMY VALUE
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

