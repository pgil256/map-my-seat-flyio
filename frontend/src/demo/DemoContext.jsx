import React, { createContext, useContext, useState, useCallback, useRef, useMemo } from "react";
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

  // Use ref to always get current demoData in API methods
  const demoDataRef = useRef(demoData);
  demoDataRef.current = demoData;

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
  // Use demoDataRef.current for reads to always get fresh data
  const demoApi = useMemo(() => ({
    getCurrentUser: () => Promise.resolve(demoDataRef.current.user),

    getPeriods: () => Promise.resolve([...demoDataRef.current.periods]),

    getPeriod: (username, periodId) => {
      // periodId may come as string from URL params
      const id = typeof periodId === 'string' ? parseInt(periodId, 10) : periodId;
      const period = demoDataRef.current.periods.find(p => p.periodId === id);
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
      setDemoData(prev => ({
        ...prev,
        periods: [...prev.periods, newPeriod],
      }));
      return Promise.resolve(newPeriod);
    },

    updatePeriod: (username, periodId, data) => {
      const id = typeof periodId === 'string' ? parseInt(periodId, 10) : periodId;
      setDemoData(prev => ({
        ...prev,
        periods: prev.periods.map(p =>
          p.periodId === id ? { ...p, ...data } : p
        ),
      }));
      return Promise.resolve({ periodId: id, ...data });
    },

    deletePeriod: (username, periodId) => {
      const id = typeof periodId === 'string' ? parseInt(periodId, 10) : periodId;
      setDemoData(prev => ({
        ...prev,
        periods: prev.periods.filter(p => p.periodId !== id),
      }));
      return Promise.resolve(id);
    },

    createStudent: (username, periodId, data) => {
      const pId = typeof periodId === 'string' ? parseInt(periodId, 10) : periodId;
      const newStudent = {
        studentId: Date.now(),
        ...data,
      };
      setDemoData(prev => ({
        ...prev,
        periods: prev.periods.map(p =>
          p.periodId === pId
            ? { ...p, students: [...(p.students || []), newStudent] }
            : p
        ),
      }));
      return Promise.resolve(newStudent);
    },

    updateStudent: (username, periodId, studentId, data) => {
      const pId = typeof periodId === 'string' ? parseInt(periodId, 10) : periodId;
      const sId = typeof studentId === 'string' ? parseInt(studentId, 10) : studentId;
      setDemoData(prev => ({
        ...prev,
        periods: prev.periods.map(p =>
          p.periodId === pId
            ? {
                ...p,
                students: p.students.map(s =>
                  s.studentId === sId ? { ...s, ...data } : s
                )
              }
            : p
        ),
      }));
      return Promise.resolve({ studentId: sId, ...data });
    },

    deleteStudent: (username, periodId, studentId) => {
      const pId = typeof periodId === 'string' ? parseInt(periodId, 10) : periodId;
      const sId = typeof studentId === 'string' ? parseInt(studentId, 10) : studentId;
      setDemoData(prev => ({
        ...prev,
        periods: prev.periods.map(p =>
          p.periodId === pId
            ? { ...p, students: p.students.filter(s => s.studentId !== sId) }
            : p
        ),
      }));
      return Promise.resolve(sId);
    },

    getClassroom: (username, classroomId) => Promise.resolve(demoDataRef.current.classroom ? { ...demoDataRef.current.classroom } : null),

    getClassrooms: () => Promise.resolve(demoDataRef.current.classroom ? [{ ...demoDataRef.current.classroom }] : []),

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

    getSeatingCharts: (username, classroomId) => Promise.resolve([...demoDataRef.current.seatingCharts]),

    getSeatingChart: (username, classroomId, seatingChartId) => {
      const id = typeof seatingChartId === 'string' ? parseInt(seatingChartId, 10) : seatingChartId;
      const chart = demoDataRef.current.seatingCharts.find(c => c.seatingChartId === id);
      return Promise.resolve(chart ? { ...chart } : null);
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
      const id = typeof seatingChartId === 'string' ? parseInt(seatingChartId, 10) : seatingChartId;
      setDemoData(prev => ({
        ...prev,
        seatingCharts: prev.seatingCharts.map(c =>
          c.seatingChartId === id ? { ...c, ...data } : c
        ),
      }));
      return Promise.resolve({ seatingChartId: id, ...data });
    },

    deleteSeatingChart: (username, classroomId, seatingChartId) => {
      const id = typeof seatingChartId === 'string' ? parseInt(seatingChartId, 10) : seatingChartId;
      setDemoData(prev => ({
        ...prev,
        seatingCharts: prev.seatingCharts.filter(c => c.seatingChartId !== id),
      }));
      return Promise.resolve(1);
    },

    getConstraints: () => Promise.resolve([]),
    createConstraint: () => Promise.resolve({ constraintId: Date.now() }),
    deleteConstraint: () => Promise.resolve(),
  }), []);

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
