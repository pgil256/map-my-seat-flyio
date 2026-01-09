import React, { createContext, useContext, useState, useCallback } from "react";
import { demoUser, demoPeriods, demoClassroom, demoSeatingChart } from "./demoData";

const DemoContext = createContext();

export function DemoProvider({ children }) {
  const [isDemo, setIsDemo] = useState(false);
  const [demoData, setDemoData] = useState({
    user: demoUser,
    periods: demoPeriods,
    classroom: demoClassroom,
    seatingCharts: [demoSeatingChart],
  });

  const startDemo = useCallback(() => {
    setIsDemo(true);
    // Reset demo data to initial state
    setDemoData({
      user: demoUser,
      periods: [...demoPeriods],
      classroom: { ...demoClassroom },
      seatingCharts: [{ ...demoSeatingChart }],
    });
  }, []);

  const exitDemo = useCallback(() => {
    setIsDemo(false);
  }, []);

  // Demo API methods that work with local state
  const demoApi = {
    getCurrentUser: () => Promise.resolve(demoData.user),

    getPeriods: () => Promise.resolve(demoData.periods),

    getPeriod: (username, periodId) => {
      const period = demoData.periods.find(p => p.periodId === periodId);
      return Promise.resolve(period || null);
    },

    createPeriod: (username, data) => {
      const newPeriod = {
        periodId: Date.now(),
        periodNumber: data.periodNumber,
        periodName: data.periodName || `Period ${data.periodNumber}`,
        userUsername: "demo_user",
        students: [],
      };
      setDemoData(prev => ({
        ...prev,
        periods: [...prev.periods, newPeriod],
      }));
      return Promise.resolve(newPeriod);
    },

    updatePeriod: (username, periodId, data) => {
      setDemoData(prev => ({
        ...prev,
        periods: prev.periods.map(p =>
          p.periodId === periodId ? { ...p, ...data } : p
        ),
      }));
      return Promise.resolve({ periodId, ...data });
    },

    deletePeriod: (username, periodId) => {
      setDemoData(prev => ({
        ...prev,
        periods: prev.periods.filter(p => p.periodId !== periodId),
      }));
      return Promise.resolve(periodId);
    },

    createStudent: (username, periodId, data) => {
      const newStudent = {
        studentId: Date.now(),
        ...data,
      };
      setDemoData(prev => ({
        ...prev,
        periods: prev.periods.map(p =>
          p.periodId === periodId
            ? { ...p, students: [...(p.students || []), newStudent] }
            : p
        ),
      }));
      return Promise.resolve(newStudent);
    },

    updateStudent: (username, periodId, studentId, data) => {
      setDemoData(prev => ({
        ...prev,
        periods: prev.periods.map(p =>
          p.periodId === periodId
            ? {
                ...p,
                students: p.students.map(s =>
                  s.studentId === studentId ? { ...s, ...data } : s
                )
              }
            : p
        ),
      }));
      return Promise.resolve({ studentId, ...data });
    },

    deleteStudent: (username, periodId, studentId) => {
      setDemoData(prev => ({
        ...prev,
        periods: prev.periods.map(p =>
          p.periodId === periodId
            ? { ...p, students: p.students.filter(s => s.studentId !== studentId) }
            : p
        ),
      }));
      return Promise.resolve(studentId);
    },

    getClassroom: () => Promise.resolve(demoData.classroom),

    getClassrooms: () => Promise.resolve([demoData.classroom]),

    createClassroom: () => {
      const newClassroom = {
        classroomId: Date.now(),
        userUsername: "demo_user",
        name: "New Classroom",
        seatingConfig: JSON.stringify([
          ["desk", "desk", "desk", "desk"],
          ["desk", "desk", "desk", "desk"],
          ["desk", "desk", "desk", "desk"],
        ]),
      };
      setDemoData(prev => ({
        ...prev,
        classroom: newClassroom,
      }));
      return Promise.resolve(newClassroom);
    },

    createClassroomWithName: (username, name) => {
      const newClassroom = {
        classroomId: Date.now(),
        userUsername: "demo_user",
        name,
        seatingConfig: JSON.stringify([
          ["desk", "desk", "desk", "desk"],
          ["desk", "desk", "desk", "desk"],
          ["desk", "desk", "desk", "desk"],
        ]),
      };
      setDemoData(prev => ({
        ...prev,
        classroom: newClassroom,
      }));
      return Promise.resolve(newClassroom);
    },

    updateClassroom: (username, classroomId, data) => {
      setDemoData(prev => ({
        ...prev,
        classroom: { ...prev.classroom, ...data },
      }));
      return Promise.resolve({ ...demoData.classroom, ...data });
    },

    deleteClassroom: () => {
      setDemoData(prev => ({
        ...prev,
        classroom: null,
      }));
      return Promise.resolve(true);
    },

    getSeatingCharts: () => Promise.resolve(demoData.seatingCharts),

    getSeatingChart: (username, classroomId, seatingChartId) => {
      const chart = demoData.seatingCharts.find(c => c.seatingChartId === seatingChartId);
      return Promise.resolve(chart || null);
    },

    createSeatingChart: (username, classroomId, data) => {
      const newChart = {
        seatingChartId: Date.now(),
        classroomId,
        ...data,
        createdAt: new Date().toISOString(),
      };
      setDemoData(prev => ({
        ...prev,
        seatingCharts: [...prev.seatingCharts, newChart],
      }));
      return Promise.resolve(newChart);
    },

    updateSeatingChart: (username, classroomId, seatingChartId, data) => {
      setDemoData(prev => ({
        ...prev,
        seatingCharts: prev.seatingCharts.map(c =>
          c.seatingChartId === seatingChartId ? { ...c, ...data } : c
        ),
      }));
      return Promise.resolve({ seatingChartId, ...data });
    },

    deleteSeatingChart: (username, classroomId, seatingChartId) => {
      setDemoData(prev => ({
        ...prev,
        seatingCharts: prev.seatingCharts.filter(c => c.seatingChartId !== seatingChartId),
      }));
      return Promise.resolve(1);
    },

    getConstraints: () => Promise.resolve([]),
    createConstraint: () => Promise.resolve({ constraintId: Date.now() }),
    deleteConstraint: () => Promise.resolve(),
  };

  return (
    <DemoContext.Provider value={{ isDemo, startDemo, exitDemo, demoApi, demoData }}>
      {children}
    </DemoContext.Provider>
  );
}

export function useDemo() {
  const context = useContext(DemoContext);
  if (!context) {
    throw new Error("useDemo must be used within a DemoProvider");
  }
  return context;
}

export default DemoContext;
