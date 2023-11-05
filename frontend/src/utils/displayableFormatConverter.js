

export function displayableFormatConverter(exerciseList, exerciseClass) {
    // We convert the JSON received from python backend into a displayable format in JS.
        let displayableString = "";
        for (let n = 0; n < exerciseList.length; n++) {
            if (exerciseList[n].exerciseClass !== exerciseClass) {
                continue;
            }
            displayableString += exerciseList[n].exerciseName + ": ";
            const current_exercise = exerciseList[n].exercises;
            for (let i = 0; i < current_exercise.length; i++) {  
                if (current_exercise[i].both_sides) {
                    displayableString += current_exercise[i].weights + '+' + current_exercise[i].weights;
                } else {
                    displayableString += current_exercise[i].weights;
                }
                displayableString += ', ';
                displayableString += current_exercise[i].reps[0];
                for (let m = 1; m < current_exercise[i].reps.length; m++) {
                    displayableString += '/';
                    displayableString += current_exercise[i].reps[m];
                }
                if (current_exercise[i].comments !== "") {
                    displayableString += ', ';
                    displayableString += exerciseList[n].comments;
                }
            }
            displayableString += '\n';
        }
        return displayableString;
}