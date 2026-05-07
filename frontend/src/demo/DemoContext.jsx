import { createContext, useContext, useState, useCallback, useRef, useMemo } from "react";
import { demoUser, demoPeriods, demoClassroom, demoSeatingChart, demoConstraints } from "./demoData";

const toInt = (v) => (typeof v === "string" ? parseInt(v, 10) : v);

function initialDemoState() {
  const constraints = {};
  for (const [pid, list] of Object.entries(demoConstraints)) {
    constraints[pid] = list.map((c) => ({ ...c }));
  }
  return {
    user: demoUser,
    periods: [...demoPeriods],
    classrooms: [{ ...demoClassroom }],
    seatingCharts: [{ ...demoSeatingChart }],
    constraints,
  };
}

const blankClassroomConfig = JSON.stringify([
  ["desk", "desk", "desk", "desk"],
  ["desk", "desk", "desk", "desk"],
  ["desk", "desk", "desk", "desk"],
]);

const DemoContext = createContext();

export function DemoProvider({ children }) {
  const [isDemo, setIsDemo] = useState(false);
  const [demoData, setDemoData] = useState(initialDemoState);

  const demoDataRef = useRef(demoData);
  demoDataRef.current = demoData;

  const startDemo = useCallback(() => {
    setIsDemo(true);
    setDemoData(initialDemoState());
  }, []);

  const exitDemo = useCallback(() => {
    setIsDemo(false);
  }, []);

  const demoApi = useMemo(() => ({
    getCurrentUser: () => Promise.resolve(demoDataRef.current.user),

    getPeriods: () => Promise.resolve([...demoDataRef.current.periods]),

    getPeriod: (username, periodId) => {
      const id = toInt(periodId);
      const period = demoDataRef.current.periods.find((p) => p.periodId === id);
      return Promise.resolve(period ? { ...period } : null);
    },

    createPeriod: (username, data) => {
      const newPeriod = {
        periodId: Date.now(),
        number: data.number,
        title: data.title || `Period ${data.number}`,
        schoolYear: data.schoolYear || "2025-2026",
        userUsername: "demo_user",
        students: [],
      };
      setDemoData((prev) => ({ ...prev, periods: [...prev.periods, newPeriod] }));
      return Promise.resolve(newPeriod);
    },

    updatePeriod: (username, periodId, data) => {
      const id = toInt(periodId);
      setDemoData((prev) => ({
        ...prev,
        periods: prev.periods.map((p) => (p.periodId === id ? { ...p, ...data } : p)),
      }));
      return Promise.resolve({ periodId: id, ...data });
    },

    deletePeriod: (username, periodId) => {
      const id = toInt(periodId);
      setDemoData((prev) => ({
        ...prev,
        periods: prev.periods.filter((p) => p.periodId !== id),
      }));
      return Promise.resolve(id);
    },

    createStudent: (username, periodId, data) => {
      const pId = toInt(periodId);
      const newStudent = { studentId: Date.now(), ...data };
      setDemoData((prev) => ({
        ...prev,
        periods: prev.periods.map((p) =>
          p.periodId === pId ? { ...p, students: [...(p.students || []), newStudent] } : p
        ),
      }));
      return Promise.resolve(newStudent);
    },

    updateStudent: (username, periodId, studentId, data) => {
      const pId = toInt(periodId);
      const sId = toInt(studentId);
      setDemoData((prev) => ({
        ...prev,
        periods: prev.periods.map((p) =>
          p.periodId === pId
            ? { ...p, students: p.students.map((s) => (s.studentId === sId ? { ...s, ...data } : s)) }
            : p
        ),
      }));
      return Promise.resolve({ studentId: sId, ...data });
    },

    deleteStudent: (username, periodId, studentId) => {
      const pId = toInt(periodId);
      const sId = toInt(studentId);
      setDemoData((prev) => ({
        ...prev,
        periods: prev.periods.map((p) =>
          p.periodId === pId ? { ...p, students: p.students.filter((s) => s.studentId !== sId) } : p
        ),
      }));
      return Promise.resolve(sId);
    },

    getClassroom: (username, classroomId) => {
      const classrooms = demoDataRef.current.classrooms;
      if (!classroomId) {
        return Promise.resolve(classrooms.length > 0 ? { ...classrooms[0] } : null);
      }
      const classroom = classrooms.find((c) => c.classroomId === toInt(classroomId));
      return Promise.resolve(classroom ? { ...classroom } : null);
    },

    getClassrooms: () => Promise.resolve([...demoDataRef.current.classrooms]),

    createClassroom: () => {
      const newClassroom = {
        classroomId: Date.now(),
        userUsername: "demo_user",
        name: "New Classroom",
        seatingConfig: blankClassroomConfig,
      };
      setDemoData((prev) => ({ ...prev, classrooms: [...prev.classrooms, newClassroom] }));
      return Promise.resolve(newClassroom);
    },

    createClassroomWithName: (username, name) => {
      const newClassroom = {
        classroomId: Date.now(),
        userUsername: "demo_user",
        name,
        seatingConfig: blankClassroomConfig,
      };
      setDemoData((prev) => ({ ...prev, classrooms: [...prev.classrooms, newClassroom] }));
      return Promise.resolve(newClassroom);
    },

    updateClassroom: (username, classroomId, data) => {
      const id = toInt(classroomId);
      let updated;
      setDemoData((prev) => ({
        ...prev,
        classrooms: prev.classrooms.map((c) => {
          if (c.classroomId !== id) return c;
          updated = { ...c, ...data };
          return updated;
        }),
      }));
      return Promise.resolve(updated);
    },

    deleteClassroom: (username, classroomId) => {
      const id = toInt(classroomId);
      setDemoData((prev) => ({
        ...prev,
        classrooms: prev.classrooms.filter((c) => c.classroomId !== id),
      }));
      return Promise.resolve(true);
    },

    getSeatingCharts: () => Promise.resolve([...demoDataRef.current.seatingCharts]),

    getSeatingChart: (username, classroomId, seatingChartId) => {
      const id = toInt(seatingChartId);
      const chart = demoDataRef.current.seatingCharts.find((c) => c.seatingChartId === id);
      return Promise.resolve(chart ? { ...chart } : null);
    },

    createSeatingChart: (username, classroomId, data) => {
      const charts = demoDataRef.current.seatingCharts;
      const maxNumber = charts.length > 0 ? Math.max(...charts.map((c) => c.number || 0)) : 0;
      const newChart = {
        seatingChartId: Date.now(),
        classroomId,
        number: maxNumber + 1,
        ...data,
        createdAt: new Date().toISOString(),
      };
      setDemoData((prev) => ({ ...prev, seatingCharts: [...prev.seatingCharts, newChart] }));
      return Promise.resolve(newChart);
    },

    updateSeatingChart: (username, classroomId, seatingChartId, data) => {
      const id = toInt(seatingChartId);
      setDemoData((prev) => ({
        ...prev,
        seatingCharts: prev.seatingCharts.map((c) =>
          c.seatingChartId === id ? { ...c, ...data } : c
        ),
      }));
      return Promise.resolve({ seatingChartId: id, ...data });
    },

    deleteSeatingChart: (username, classroomId, seatingChartId) => {
      const id = toInt(seatingChartId);
      setDemoData((prev) => ({
        ...prev,
        seatingCharts: prev.seatingCharts.filter((c) => c.seatingChartId !== id),
      }));
      return Promise.resolve(1);
    },

    duplicateSeatingChart: (username, classroomId, seatingChartId, label) => {
      const id = toInt(seatingChartId);
      const original = demoDataRef.current.seatingCharts.find((c) => c.seatingChartId === id);
      if (!original) return Promise.resolve(null);
      const newChart = {
        ...original,
        seatingChartId: Date.now(),
        label: label || `Copy of ${original.label || "Chart"}`,
        createdAt: new Date().toISOString(),
      };
      setDemoData((prev) => ({ ...prev, seatingCharts: [newChart, ...prev.seatingCharts] }));
      return Promise.resolve(newChart);
    },

    getConstraints: (username, periodId) => {
      const id = toInt(periodId);
      const list = demoDataRef.current.constraints[id] || [];
      return Promise.resolve(list.map((c) => ({ ...c })));
    },

    createConstraint: (username, periodId, data) => {
      const id = toInt(periodId);
      const period = demoDataRef.current.periods.find((p) => p.periodId === id);
      const s1 = period?.students.find((s) => s.studentId === data.studentId1);
      const s2 = period?.students.find((s) => s.studentId === data.studentId2);
      const newConstraint = {
        constraintId: Date.now(),
        studentId1: data.studentId1,
        studentId2: data.studentId2,
        constraintType: data.constraintType,
        studentName1: s1?.name,
        studentName2: s2?.name,
      };
      setDemoData((prev) => ({
        ...prev,
        constraints: {
          ...prev.constraints,
          [id]: [...(prev.constraints[id] || []), newConstraint],
        },
      }));
      return Promise.resolve(newConstraint);
    },

    deleteConstraint: (username, periodId, constraintId) => {
      const pid = toInt(periodId);
      const cid = toInt(constraintId);
      setDemoData((prev) => ({
        ...prev,
        constraints: {
          ...prev.constraints,
          [pid]: (prev.constraints[pid] || []).filter((c) => c.constraintId !== cid),
        },
      }));
      return Promise.resolve();
    },
  }), []);

  return (
    <DemoContext.Provider value={{ isDemo, startDemo, exitDemo, demoApi, demoData }}>
      {children}
    </DemoContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useDemo() {
  const context = useContext(DemoContext);
  if (!context) {
    throw new Error("useDemo must be used within a DemoProvider");
  }
  return context;
}

export default DemoContext;
