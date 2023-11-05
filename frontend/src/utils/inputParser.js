// Exported function is in the bottom of the file.


function basicStringHandling(workoutstring) {
    workoutstring = workoutstring.replace(" ", "");
    if (workoutstring === "") {
        console.log('Found empty row.');
        return [false, false]; // Skip empty rows
    }

    const strippedString = workoutstring.split(":");
    if (strippedString.length === 2 && strippedString[1] === "") {
        return [false, false]; // This means that it is a headliner row, skip it.
    }

    const exerciseName = strippedString[0];
    const exerciseData_string = strippedString[1];
    const exerciseData_raw = exerciseData_string.split(",");
    return { exerciseName, exerciseData_raw };
}

function weightHandling(exerciseData_raw) {
    let weights = exerciseData_raw[0];
    let both_sides = false; // Default value

    // If weights are in the format 80+80, we need to split them
    if (weights.includes('+')) {
        weights = weights.replace(" ", "").split("+")[0];
        weights = parseFloat(weights);
        both_sides = true;
    }

    return { weights, both_sides };
}

function repsHandling(exerciseData_raw) {
    let reps_str = exerciseData_raw[1];
    reps_str = reps_str.replace(" ", "");
    const reps = reps_str.split("/").map(rep => parseInt(rep, 10));
    return reps;
}


export function inputParser(workouts_in_string, exerciseClass) {
    try {
        const workoutlist_final = [];

        // Row splitting
        const workoutlist_raw = workouts_in_string.split('\n');

        // We perform same operations for each workout
        workoutlist_raw.forEach(workoutstring => {
            // TODO inspection if there are multiple weights used in the exercise

            // Basic string handling
            const { exerciseName, exerciseData_raw } = basicStringHandling(workoutstring);
            if (!exerciseName) {
                return; // Skip empty rows
            }

            // Weight handling
            const { weights, both_sides } = weightHandling(exerciseData_raw);

            // Reps handling
            const reps = repsHandling(exerciseData_raw);

            // Comment handling
            const comments = exerciseData_raw[2] || "";

            // Create the JSON object
            const parsedData = {
                exerciseClass: exerciseClass,
                exerciseName,
                exercises: [{
                    weights,
                    both_sides,
                    reps
                }],
                comments
            };
            // Add it into the all workouts list
            workoutlist_final.push(parsedData);
        });
        return workoutlist_final;
    } catch (error) {
        return [];
    }
}