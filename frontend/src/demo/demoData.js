// Sample data for demo mode
export const demoUser = {
  username: "demo_user",
  firstName: "Demo",
  lastName: "User",
  email: "demo@example.com",
};

export const demoPeriods = [
  {
    periodId: 1,
    periodNumber: 1,
    periodName: "Morning Math",
    userUsername: "demo_user",
    students: [
      { studentId: 1, name: "Emma Johnson", grade: "9", gender: "female", isESE: false, has504: false, isELL: false, isEBD: false },
      { studentId: 2, name: "Liam Smith", grade: "9", gender: "male", isESE: true, has504: false, isELL: false, isEBD: false },
      { studentId: 3, name: "Olivia Brown", grade: "9", gender: "female", isESE: false, has504: true, isELL: false, isEBD: false },
      { studentId: 4, name: "Noah Davis", grade: "9", gender: "male", isESE: false, has504: false, isELL: true, isEBD: false },
      { studentId: 5, name: "Ava Wilson", grade: "9", gender: "female", isESE: false, has504: false, isELL: false, isEBD: false },
      { studentId: 6, name: "Mason Miller", grade: "9", gender: "male", isESE: false, has504: false, isELL: false, isEBD: true },
      { studentId: 7, name: "Sophia Taylor", grade: "9", gender: "female", isESE: false, has504: false, isELL: false, isEBD: false },
      { studentId: 8, name: "James Anderson", grade: "9", gender: "male", isESE: true, has504: false, isELL: false, isEBD: false },
      { studentId: 9, name: "Isabella Thomas", grade: "9", gender: "female", isESE: false, has504: true, isELL: false, isEBD: false },
      { studentId: 10, name: "Benjamin Jackson", grade: "9", gender: "male", isESE: false, has504: false, isELL: false, isEBD: false },
      { studentId: 11, name: "Mia White", grade: "9", gender: "female", isESE: false, has504: false, isELL: true, isEBD: false },
      { studentId: 12, name: "Lucas Harris", grade: "9", gender: "male", isESE: false, has504: false, isELL: false, isEBD: false },
    ],
  },
  {
    periodId: 2,
    periodNumber: 2,
    periodName: "Science Lab",
    userUsername: "demo_user",
    students: [
      { studentId: 13, name: "Charlotte Martin", grade: "10", gender: "female", isESE: false, has504: false, isELL: false, isEBD: false },
      { studentId: 14, name: "Henry Garcia", grade: "10", gender: "male", isESE: true, has504: false, isELL: false, isEBD: false },
      { studentId: 15, name: "Amelia Martinez", grade: "10", gender: "female", isESE: false, has504: false, isELL: false, isEBD: false },
      { studentId: 16, name: "Alexander Robinson", grade: "10", gender: "male", isESE: false, has504: true, isELL: false, isEBD: false },
      { studentId: 17, name: "Harper Clark", grade: "10", gender: "female", isESE: false, has504: false, isELL: true, isEBD: false },
      { studentId: 18, name: "William Lewis", grade: "10", gender: "male", isESE: false, has504: false, isELL: false, isEBD: false },
      { studentId: 19, name: "Evelyn Lee", grade: "10", gender: "female", isESE: false, has504: false, isELL: false, isEBD: true },
      { studentId: 20, name: "Michael Walker", grade: "10", gender: "male", isESE: false, has504: false, isELL: false, isEBD: false },
    ],
  },
  {
    periodId: 3,
    periodNumber: 3,
    periodName: "English Literature",
    userUsername: "demo_user",
    students: [
      { studentId: 21, name: "Abigail Hall", grade: "11", gender: "female", isESE: false, has504: false, isELL: false, isEBD: false },
      { studentId: 22, name: "Daniel Allen", grade: "11", gender: "male", isESE: false, has504: false, isELL: false, isEBD: false },
      { studentId: 23, name: "Emily Young", grade: "11", gender: "female", isESE: true, has504: false, isELL: false, isEBD: false },
      { studentId: 24, name: "Matthew King", grade: "11", gender: "male", isESE: false, has504: false, isELL: false, isEBD: false },
      { studentId: 25, name: "Elizabeth Wright", grade: "11", gender: "female", isESE: false, has504: true, isELL: false, isEBD: false },
      { studentId: 26, name: "Joseph Scott", grade: "11", gender: "male", isESE: false, has504: false, isELL: false, isEBD: false },
      { studentId: 27, name: "Sofia Green", grade: "11", gender: "female", isESE: false, has504: false, isELL: true, isEBD: false },
      { studentId: 28, name: "David Adams", grade: "11", gender: "male", isESE: false, has504: false, isELL: false, isEBD: false },
      { studentId: 29, name: "Avery Baker", grade: "11", gender: "female", isESE: false, has504: false, isELL: false, isEBD: false },
      { studentId: 30, name: "Andrew Nelson", grade: "11", gender: "male", isESE: false, has504: false, isELL: false, isEBD: true },
    ],
  },
];

// 5x6 classroom layout
export const demoClassroom = {
  classroomId: 1,
  userUsername: "demo_user",
  name: "Room 101",
  seatingConfig: JSON.stringify([
    ["desk", "desk", "desk", "desk", "desk", "desk"],
    ["desk", "desk", "desk", "desk", "desk", "desk"],
    ["empty", "empty", "empty", "empty", "empty", "empty"],
    ["desk", "desk", "desk", "desk", "desk", "desk"],
    ["desk", "desk", "desk", "desk", "desk", "teacher-desk"],
  ]),
};

// Pre-generated seating chart for Period 1
export const demoSeatingChart = {
  seatingChartId: 1,
  classroomId: 1,
  chartData: JSON.stringify([
    ["Emma Johnson", "Liam Smith", "Olivia Brown", "Noah Davis", "Ava Wilson", "Mason Miller"],
    ["Sophia Taylor", "James Anderson", "Isabella Thomas", "Benjamin Jackson", "Mia White", "Lucas Harris"],
    ["empty", "empty", "empty", "empty", "empty", "empty"],
    ["", "", "", "", "", ""],
    ["", "", "", "", "", "Teacher"],
  ]),
  label: "Default Arrangement",
  periodId: 1,
  createdAt: new Date().toISOString(),
};
