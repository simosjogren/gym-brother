# Computing backend for handling all the computing requests from the client.
# This is the main server file that will be run on the server.
# Author: Simo Sjögren

from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route('/parse-input', methods=['POST'])
def parse_input():
    # Get the JSON data from the request
    data = request.get_json()

    # Get the string from the JSON object
    input_string = data["string"]
    print(input_string)
    fakeParsedData = {'exerciseName': 'Ylätalja', 'weight': [{'weight': 80, 'both_sides': True, 'reps': [10,10,8]}], 'rest': '1min', 'comment': 'Enemmän ensikerralla!'}
    return jsonify(fakeParsedData)


if __name__ == '__main__':
    app.run(debug=True)

