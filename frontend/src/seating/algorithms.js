/**
 * Seating chart generation algorithms.
 * Pure functions — no React, no side effects.
 */

function sortAndPrioritizeStudents(students, classroom) {
  let modifiedStudentsList = [...students];

  // Sorting based on seating preference
  if (classroom.seatAlphabetical) {
    modifiedStudentsList.sort((a, b) => a.name.localeCompare(b.name));
  } else if (classroom.seatRandomize) {
    for (let i = modifiedStudentsList.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [modifiedStudentsList[i], modifiedStudentsList[j]] = [
        modifiedStudentsList[j],
        modifiedStudentsList[i],
      ];
    }
  } else if (classroom.seatHighLow) {
    const lowToHigh = [...modifiedStudentsList].sort(
      ({ grade: a }, { grade: b }) => b - a
    );
    const result = [];
    while (lowToHigh.length) {
      const low = lowToHigh.shift();
      if (low) result.push(low);
      const high = lowToHigh.pop();
      if (high) result.push(high);
    }
    modifiedStudentsList = result;
  } else if (classroom.seatMaleFemale) {
    const maleToFemale = [...modifiedStudentsList].sort(
      ({ gender: a }, { gender: b }) => a.localeCompare(b)
    );
    const result = [];
    while (maleToFemale.length) {
      const male = maleToFemale.shift();
      if (male) result.push(male);
      const female = maleToFemale.pop();
      if (female) result.push(female);
    }
    modifiedStudentsList = result;
  }

  // Prioritize based on classroom settings
  let priorityStudents = [];
  if (classroom.eseIsPriority) {
    priorityStudents = modifiedStudentsList.filter(
      (student) => student.isESE
    );
  } else if (classroom.ellIsPriority) {
    priorityStudents = modifiedStudentsList.filter(
      (student) => student.isELL
    );
  } else if (classroom.fiveZeroFourIsPriority) {
    priorityStudents = modifiedStudentsList.filter(
      (student) => student.has504
    );
  } else if (classroom.ebdIsPriority) {
    priorityStudents = modifiedStudentsList.filter(
      (student) => student.isEBD
    );
  }

  modifiedStudentsList = priorityStudents.concat(
    modifiedStudentsList.filter(
      (student) => !priorityStudents.includes(student)
    )
  );

  return modifiedStudentsList;
}

function spreadStudents(matrix, sortedStudents) {
  const deskCount = matrix.flat().filter((cell) => cell === "desk").length;
  const emptyDesks = deskCount - sortedStudents.length;

  if (emptyDesks <= 0) {
    return sortedStudents;
  }

  let spacedStudents = [...sortedStudents];
  for (let i = 1; i <= emptyDesks; i++) {
    const position = sortedStudents.length - i;
    spacedStudents.splice(position, 0, { name: "" });
  }
  return spacedStudents;
}

export { sortAndPrioritizeStudents, spreadStudents };
