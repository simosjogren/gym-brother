"""
Not using except-blocks because we want the error to be thrown
in the main program, if there is something wrong with the user input.
"""


def basicStringHandling(workoutstring):
    """
    This function takes a string and returns the exercise name and the exercise data in a tuple
    It does the basic handling of the given workout row string.
    """
    workoutstring = workoutstring.replace(" ", "")
    if workoutstring == "":
        print('Found empty row.')
        return False, False    # Skip empty rows
    strippedString = workoutstring.split(":")
    if len(strippedString) == 2 and strippedString[1] == "":
        return False, False    # This means that it is a headliner row, skip it
    exerciseName = strippedString[0]
    exerciseData_string = strippedString[1]
    exerciseData_raw = exerciseData_string.split(",")
    return exerciseName, exerciseData_raw


def weightHandling(exerciseData_raw):
    weights = exerciseData_raw[0]
    both_sides = False  # Default value
    # If weights are in the format 80+80, we need to split them
    if ('+' in weights):
        weights = weights.replace(" ", "")
        weights = weights.split("+")[0]
        weights = float(weights)
        both_sides = True
    return weights, both_sides


def repsHandling(exerciseData_raw):
    reps_str = exerciseData_raw[1]
    reps_str = reps_str.replace(" ", "")
    reps = reps_str.split("/")
    for i in range(len(reps)):
        reps[i] = int(reps[i])
    return reps