// Methods for handling workout posts.
// Simo Sjögren

// Module imports
const randomatic = require('randomatic');
const exercises = require('../config/initializeExercises');
const credentials = require('../config/initalizeCredentials');

async function getLatestWorkoutData(username) {
    let exerciseList = [];
    try {
      const dbUser = await credentials.findOne({
        where: { id: username }
      });
      const latestExercises = JSON.parse(dbUser.latestExercise);
      console.log('Latest Exercises:', latestExercises); // Debug log
  
      for (let n = 0; n < latestExercises.length; n++) {
        const foundRow = await exercises.findOne({
          where: { id: latestExercises[n], username: username }
        });
        console.log('Found Row:', foundRow.dataValues); // Debug log
  
        if (foundRow) {
          exerciseList.push(foundRow.dataValues);
        } else {
          console.log('Exercise not found in the database:', latestExercises[n]);
        }
      }
      if (exerciseList.length === 0) {
        console.log('Did not find any matching exercises.')
      }
      return exerciseList;
    } catch (error) {
      console.log('Error: ', error);
      return null;
    }
  }
  
  
  async function createAndEditExerciseData(new_exercises, old_exercises, username) {
    console.log("NEW EXERCISES: ", new_exercises);
    console.log("OLD EXERCISES: ", old_exercises);
    const oldIdList = old_exercises.map(item => item.id);
    const newIdList = [];   // We will add all the found IDs here.
    for (let i=0; i < new_exercises.length; i++) {
      const foundMatchingIndex = old_exercises.findIndex((item) => item.exerciseName === new_exercises[i].exerciseName);
      // This returns index of old_exercises.
      if (foundMatchingIndex === -1) {
        // This means that the exercise is new and should be added to the database.
        console.log('Adding new exercise to the database.')
        const exerciseId = randomatic('Aa0', 10);
        await exercises.create({
          id: exerciseId,
          username: username,
          exerciseClass: new_exercises[i].exerciseClass,
          exerciseName: new_exercises[i].exerciseName,
          exercises: JSON.stringify(new_exercises[i].exercises),
          comments: new_exercises[i].comment
        });
        console.log('Created new row to the database.');
        newIdList.push(exerciseId); // Add the new ID to the list for comparing afterwards.
        const updatedCredentials = await credentials.findOne({ where: { id: username } });
        const currentLatestExercises = JSON.parse(updatedCredentials.latestExercise);
        currentLatestExercises.push(exerciseId);
        await credentials.update(
          { latestExercise: JSON.stringify(currentLatestExercises) },
          { where: { id: username } }
        );
        console.log('Updated latest exercises for user.');
      } else {
        // This means the exercise is already in the database and should be updated.
        const old_id = oldIdList[foundMatchingIndex];
        await exercises.update(
          { exercises: JSON.stringify(new_exercises[i].exercises), comments: new_exercises[i].comment },
          { where: { id: old_id, username: username } }
        );
        newIdList.push(old_id); // Add the new ID to the list for comparing afterwards.
        console.log(`Updated exercise for ID ${old_exercises[foundMatchingIndex].id}`);
      }
    }
    return { newIdList, oldIdList };
  }
  
  
  async function adjustLastExercises(newIdList, oldIdList, username) {
    // We apply a filter the oldIdList to find the IDs which are not in the newIdList.
    const missingIds = oldIdList.filter(id => !newIdList.includes(id));
    if (missingIds.length > 0) {
      credentials.findOne({ where: { id: username } }).then(async (dbUser) => {
        const latestExercises = JSON.parse(dbUser.latestExercise);
        // Now we are gonna filter out the missing IDs from the latestExercises.
        const filteredLatestExercises = latestExercises.filter(item => !missingIds.includes(item));
        // Then we are gonna just push the changes to the database.
        await credentials.update(
          { latestExercise: JSON.stringify(filteredLatestExercises) },
          { where: { id: username } }
        );
        console.log('Updated latest exercises for user.');
        return true;
      });
    } else {
      // No missing IDs were found.
      console.log('Did not find any missing IDs. No modifications made.')
      return false;
    }
  }


module.exports = {
    getLatestWorkoutData,
    createAndEditExerciseData,
    adjustLastExercises
};