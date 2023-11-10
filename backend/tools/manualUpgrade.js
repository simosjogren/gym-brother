

const MUSCLEGAIN_INCREASES = {
    rep_low: 6,
    rep_high: 12,
    rep_upstep: 2,
    rep_downstep: 2,
    weight_upstep: 5,
    weight_downstep: 2.5
};

function manualUpgrade_muscleGain(old_exercises) {
    let full_old_exercises = old_exercises;
    old_exercises = old_exercises.exercises;
    let new_exercises = [];
    for (let n=0; n < old_exercises.length; n++) {
        const old_exercise = old_exercises[n];
        let old_reps = old_exercise.reps;
        // Parsing all to floats:
        old_reps = old_reps.map(reps => parseInt(reps, 10));
        const old_reps_len = old_reps.length;
        const old_weight = parseFloat(old_exercise.weights);

        // Default values, will be changed.
        let new_weight = old_weight;
        let new_reps = old_reps;

        // Take the min and max from the reps.
        const old_rep_max = Math.max(...old_reps);
        const old_rep_min = Math.min(...old_reps);

        // Default values, will be changed.
        let biggest_value = old_rep_max;
        let delaystep = 0;

        // Case where reps is over the maximum, too lightweight
        if (old_rep_max >= MUSCLEGAIN_INCREASES.rep_high) {
            new_weight += MUSCLEGAIN_INCREASES.weight_upstep;
            // If for example the maximum reps was 12, now its time to increase weights and try lower reps.
            biggest_value = MUSCLEGAIN_INCREASES.rep_high
            delaystep = 1;
        // Case where it was too heavy. Time to drop some weight.
        } else if (old_rep_max < MUSCLEGAIN_INCREASES.rep_low) {
            new_weight -= MUSCLEGAIN_INCREASES.weight_downstep;
            biggest_value = MUSCLEGAIN_INCREASES.rep_high
            delaystep = 0;
        // Case where user was between min and max.
        } else {
            new_weight = old_weight;
            biggest_value = old_rep_max;
            delaystep = -1;
        }

        // Now its time to build the rep increasing pattern.
        for (let i = 0; i < old_reps_len; i++) {
            const reps_candidate = biggest_value - (i + delaystep) * (MUSCLEGAIN_INCREASES.rep_downstep)
            if (reps_candidate < MUSCLEGAIN_INCREASES.rep_low) {
                new_reps[i] = MUSCLEGAIN_INCREASES.rep_low
            } else {
                new_reps[i] = reps_candidate;
            }
        }

        // Now lets build the exercises back up.
        old_exercise.weights = new_weight;
        old_exercise.reps = new_reps;
        new_exercises.push(old_exercise)
    }
    // Lastly lets append the exercises data to the full data package of the workout.
    full_old_exercises.exercises = new_exercises;
    return full_old_exercises;
}


function manualUpgrade(old_exercises) {
    return manualUpgrade_muscleGain(old_exercises);
}


module.exports = { manualUpgrade };