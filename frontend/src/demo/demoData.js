import { scoreAssignment } from "../seating/objective";
import { findTeacherDesks, matrixToSeats } from "../seating/seatGrid";
import { mulberry32, solveSeating } from "../seating/solver";

// Sample data for demo mode
export const demoUser = {
  username: "demo_user",
  firstName: "Jordan",
  lastName: "Sterling",
  title: "Ms.",
  email: "demo@example.com",
};

export const demoPeriods = [
  {
    periodId: 1,
    number: 1,
    title: "Morning Math",
    schoolYear: "2025-2026",
    userUsername: "demo_user",
    students: [
      { studentId: 1, name: "Emma Johnson", grade: "9", gender: "F", isESE: false, has504: false, isELL: false, isEBD: false },
      { studentId: 2, name: "Liam Smith", grade: "9", gender: "M", isESE: true, has504: false, isELL: false, isEBD: false },
      { studentId: 3, name: "Olivia Brown", grade: "9", gender: "F", isESE: false, has504: true, isELL: false, isEBD: false },
      { studentId: 4, name: "Noah Davis", grade: "9", gender: "M", isESE: false, has504: false, isELL: true, isEBD: false },
      { studentId: 5, name: "Ava Wilson", grade: "9", gender: "F", isESE: false, has504: false, isELL: false, isEBD: false },
      { studentId: 6, name: "Mason Miller", grade: "9", gender: "M", isESE: false, has504: false, isELL: false, isEBD: true },
      { studentId: 7, name: "Sophia Taylor", grade: "9", gender: "F", isESE: false, has504: false, isELL: false, isEBD: false },
      { studentId: 8, name: "James Anderson", grade: "9", gender: "M", isESE: true, has504: false, isELL: false, isEBD: false },
      { studentId: 9, name: "Isabella Thomas", grade: "9", gender: "F", isESE: false, has504: true, isELL: false, isEBD: false },
      { studentId: 10, name: "Benjamin Jackson", grade: "9", gender: "M", isESE: false, has504: false, isELL: false, isEBD: false },
      { studentId: 11, name: "Mia White", grade: "9", gender: "F", isESE: false, has504: false, isELL: true, isEBD: false },
      { studentId: 12, name: "Lucas Harris", grade: "9", gender: "M", isESE: false, has504: false, isELL: false, isEBD: false },
      { studentId: 101, name: "Aiden Carter", grade: "9", gender: "M", isESE: false, has504: false, isELL: false, isEBD: false },
      { studentId: 102, name: "Zoey Phillips", grade: "9", gender: "F", isESE: false, has504: false, isELL: true, isEBD: false },
      { studentId: 103, name: "Jackson Evans", grade: "9", gender: "M", isESE: false, has504: false, isELL: false, isEBD: false },
      { studentId: 104, name: "Layla Turner", grade: "9", gender: "F", isESE: false, has504: false, isELL: false, isEBD: false },
      { studentId: 105, name: "Caleb Diaz", grade: "9", gender: "M", isESE: false, has504: false, isELL: false, isEBD: true },
      { studentId: 106, name: "Aria Reed", grade: "9", gender: "F", isESE: false, has504: true, isELL: false, isEBD: false },
      { studentId: 107, name: "Ethan Rivera", grade: "9", gender: "M", isESE: true, has504: false, isELL: false, isEBD: false },
      { studentId: 108, name: "Penelope Cooper", grade: "9", gender: "F", isESE: false, has504: false, isELL: false, isEBD: false },
      { studentId: 109, name: "Logan Bailey", grade: "9", gender: "M", isESE: false, has504: false, isELL: false, isEBD: false },
      { studentId: 110, name: "Ellie Bell", grade: "9", gender: "F", isESE: false, has504: false, isELL: false, isEBD: false },
      { studentId: 111, name: "Owen Howard", grade: "9", gender: "M", isESE: false, has504: false, isELL: true, isEBD: false },
      { studentId: 112, name: "Stella Cox", grade: "9", gender: "F", isESE: false, has504: false, isELL: false, isEBD: false },
    ],
  },
  {
    periodId: 2,
    number: 2,
    title: "Science Lab",
    schoolYear: "2025-2026",
    userUsername: "demo_user",
    students: [
      { studentId: 13, name: "Charlotte Martin", grade: "10", gender: "F", isESE: false, has504: false, isELL: false, isEBD: false },
      { studentId: 14, name: "Henry Garcia", grade: "10", gender: "M", isESE: true, has504: false, isELL: false, isEBD: false },
      { studentId: 15, name: "Amelia Martinez", grade: "10", gender: "F", isESE: false, has504: false, isELL: false, isEBD: false },
      { studentId: 16, name: "Alexander Robinson", grade: "10", gender: "M", isESE: false, has504: true, isELL: false, isEBD: false },
      { studentId: 17, name: "Harper Clark", grade: "10", gender: "F", isESE: false, has504: false, isELL: true, isEBD: false },
      { studentId: 18, name: "William Lewis", grade: "10", gender: "M", isESE: false, has504: false, isELL: false, isEBD: false },
      { studentId: 19, name: "Evelyn Lee", grade: "10", gender: "F", isESE: false, has504: false, isELL: false, isEBD: true },
      { studentId: 20, name: "Michael Walker", grade: "10", gender: "M", isESE: false, has504: false, isELL: false, isEBD: false },
    ],
  },
  {
    periodId: 3,
    number: 3,
    title: "English Literature",
    schoolYear: "2025-2026",
    userUsername: "demo_user",
    students: [
      { studentId: 21, name: "Abigail Hall", grade: "11", gender: "F", isESE: false, has504: false, isELL: false, isEBD: false },
      { studentId: 22, name: "Daniel Allen", grade: "11", gender: "M", isESE: false, has504: false, isELL: false, isEBD: false },
      { studentId: 23, name: "Emily Young", grade: "11", gender: "F", isESE: true, has504: false, isELL: false, isEBD: false },
      { studentId: 24, name: "Matthew King", grade: "11", gender: "M", isESE: false, has504: false, isELL: false, isEBD: false },
      { studentId: 25, name: "Elizabeth Wright", grade: "11", gender: "F", isESE: false, has504: true, isELL: false, isEBD: false },
      { studentId: 26, name: "Joseph Scott", grade: "11", gender: "M", isESE: false, has504: false, isELL: false, isEBD: false },
      { studentId: 27, name: "Sofia Green", grade: "11", gender: "F", isESE: false, has504: false, isELL: true, isEBD: false },
      { studentId: 28, name: "David Adams", grade: "11", gender: "M", isESE: false, has504: false, isELL: false, isEBD: false },
      { studentId: 29, name: "Avery Baker", grade: "11", gender: "F", isESE: false, has504: false, isELL: false, isEBD: false },
      { studentId: 30, name: "Andrew Nelson", grade: "11", gender: "M", isESE: false, has504: false, isELL: false, isEBD: true },
    ],
  },
];

// 6-row x 6-col room: two desk rows, an aisle, two desk rows, then a sparse
// row with a teacher desk in the back-right corner. 27 student desks,
// fitting 24 students with realistic breathing room.
export const demoClassroomConfig = [
  ["desk", "desk", "desk", "desk", "desk", "desk"],
  ["desk", "desk", "desk", "desk", "desk", "desk"],
  ["empty", "empty", "empty", "empty", "empty", "empty"],
  ["desk", "desk", "desk", "desk", "desk", "desk"],
  ["desk", "desk", "desk", "desk", "desk", "desk"],
  ["desk", "desk", "desk", "empty", "empty", "teacher-desk"],
];

export const demoClassroom = {
  classroomId: 1,
  userUsername: "demo_user",
  name: "Room 101",
  seatAlphabetical: false,
  seatRandomize: false,
  seatHighLow: true,
  seatMaleFemale: true,
  eseIsPriority: true,
  ellIsPriority: true,
  fiveZeroFourIsPriority: true,
  ebdIsPriority: true,
  solverSeed: 20260508,
  seatingConfig: JSON.stringify(demoClassroomConfig),
};

// Constraints keyed by periodId. Each entry already has student names
// enriched, matching what StudentConstraints.jsx renders.
export const demoConstraints = {
  1: [
    { constraintId: 1001, studentId1: 2, studentId2: 6, constraintType: "separate", studentName1: "Liam Smith", studentName2: "Mason Miller" },
    { constraintId: 1002, studentId1: 4, studentId2: 10, constraintType: "separate", studentName1: "Noah Davis", studentName2: "Benjamin Jackson" },
    { constraintId: 1003, studentId1: 11, studentId2: 12, constraintType: "separate", studentName1: "Mia White", studentName2: "Lucas Harris" },
    { constraintId: 1004, studentId1: 1, studentId2: 3, constraintType: "pair", studentName1: "Emma Johnson", studentName2: "Olivia Brown" },
    { constraintId: 1005, studentId1: 7, studentId2: 9, constraintType: "pair", studentName1: "Sophia Taylor", studentName2: "Isabella Thomas" },
  ],
  2: [
    { constraintId: 2001, studentId1: 14, studentId2: 18, constraintType: "separate", studentName1: "Henry Garcia", studentName2: "William Lewis" },
    { constraintId: 2002, studentId1: 15, studentId2: 17, constraintType: "pair", studentName1: "Amelia Martinez", studentName2: "Harper Clark" },
  ],
  3: [
    { constraintId: 3001, studentId1: 22, studentId2: 30, constraintType: "separate", studentName1: "Daniel Allen", studentName2: "Andrew Nelson" },
    { constraintId: 3002, studentId1: 23, studentId2: 25, constraintType: "pair", studentName1: "Emily Young", studentName2: "Elizabeth Wright" },
  ],
};

function assignmentToChartMatrix(assignment) {
  let seatIndex = 0;
  return demoClassroomConfig.map((row) =>
    row.map((cellType) => {
      if (cellType === "empty") return "empty";
      if (cellType === "teacher-desk") return "Teacher";
      const student = assignment[seatIndex++];
      return student?.name || "";
    })
  );
}

const solvedDemo = solveSeating(
  demoPeriods[0].students,
  demoClassroom,
  demoConstraints[1],
  demoClassroomConfig,
  { rng: mulberry32(demoClassroom.solverSeed) }
);

// Pre-generated seating chart for Period 1. It is derived from the same solver
// path the live seating chart uses, so the demo fixture and live demo do not drift.
export const demoSeatingChartMatrix = assignmentToChartMatrix(solvedDemo.assignment);

export const demoSeatingChart = {
  seatingChartId: 1,
  classroomId: 1,
  number: 1,
  chartData: JSON.stringify(demoSeatingChartMatrix),
  label: "Default Arrangement",
  periodId: 1,
  createdAt: new Date().toISOString(),
};

function getStudentByName(name) {
  return demoPeriods[0].students.find((student) => student.name === name) || null;
}

function getStudentFlag(student) {
  if (!student) return null;
  if (student.isESE) return "ESE";
  if (student.has504) return "504";
  if (student.isELL) return "ELL";
  if (student.isEBD) return "EBD";
  return null;
}

function buildAssignmentFromChart() {
  const assignment = [];
  for (let rowIndex = 0; rowIndex < demoClassroomConfig.length; rowIndex++) {
    for (let colIndex = 0; colIndex < demoClassroomConfig[rowIndex].length; colIndex++) {
      if (demoClassroomConfig[rowIndex][colIndex] !== "desk") continue;
      const name = demoSeatingChartMatrix[rowIndex][colIndex];
      assignment.push(getStudentByName(name));
    }
  }
  return assignment;
}

function buildHeroRows() {
  return demoClassroomConfig.map((row, rowIndex) =>
    row.map((cellType, colIndex) => {
      if (cellType === "empty") return { aisle: true };
      if (cellType === "teacher-desk") return { teacher: true, label: "Ms. S" };
      const student = getStudentByName(demoSeatingChartMatrix[rowIndex][colIndex]);
      return {
        name: student?.name || "",
        displayName: student?.name
          ? student.name.split(" ").map((part, index) => index === 0 ? part : `${part[0]}.`).join(" ")
          : "",
        flag: getStudentFlag(student),
      };
    })
  );
}

function buildHeroPreview() {
  const score = scoreAssignment(buildAssignmentFromChart(), {
    classroom: demoClassroom,
    constraints: demoConstraints[1],
    seats: matrixToSeats(demoClassroomConfig),
    teacherDesks: findTeacherDesks(demoClassroomConfig),
  });
  const violations = score.breakdown.hardViolations || 0;
  const satisfactions = score.breakdown.pairSatisfactions || 0;

  return {
    roomLabel: "Room 101",
    periodLabel: "Period 1 - Morning Math",
    rows: buildHeroRows(),
    score: Math.round(score.total),
    status: `${violations === 0 ? "No violations" : `${violations} violation${violations > 1 ? "s" : ""}`} - ${satisfactions} pair${satisfactions === 1 ? "" : "s"} met`,
  };
}

export const demoHeroPreview = buildHeroPreview();
