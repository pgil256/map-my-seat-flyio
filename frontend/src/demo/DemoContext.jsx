import { createContext, useContext, useState, useCallback, useRef, useMemo, useEffect } from "react";
import { demoUser, demoPeriods, demoClassroom, demoSeatingChart, demoConstraints } from "./demoData";

// Deep-clone the period-keyed constraint map so each demo session starts fresh.
function cloneConstraints(src) {
  const out = {};
  for (const [pid, list] of Object.entries(src)) {
    out[pid] = list.map((c) => ({ ...c }));
  }
  return out;
}

const DemoContext = createContext();

export function DemoProvider({ children }) {
  const [isDemo, setIsDemo] = useState(false);
  const [demoData, setDemoData] = useState({
    user: demoUser,
    periods: demoPeriods,
    classrooms: [demoClassroom],
    seatingCharts: [demoSeatingChart],
    constraints: cloneConstraints(demoConstraints),
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
      classrooms: [{ ...demoClassroom }],
      seatingCharts: [{ ...demoSeatingChart }],
      constraints: cloneConstraints(demoConstraints),
    });
  }, []);

  const exitDemo = useCallback(() => {
    setIsDemo(false);
  }, []);

  // Auto-start demo when the page is opened with `?demo=1` (so deep-links and
  // headless screenshots land on the populated chart without going through
  // the Try Demo button first).
  //
  // Mount-only by design: we read the URL once, and `isDemo` / `startDemo`
  // are intentionally absent from the dep array. Including `isDemo` would
  // re-fire after startDemo flips it to true (no-op but noisy); including
  // `startDemo` would re-fire whenever it changes identity. If a future
  // eslint upgrade turns this disable into an error, switch to a useRef
  // sentinel rather than expanding the dep array.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const wantsDemo = new URLSearchParams(window.location.search).get("demo");
    if (wantsDemo && !isDemo) startDemo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

    getClassroom: (username, classroomId) => {
      const id = typeof classroomId === 'string' ? parseInt(classroomId, 10) : classroomId;
      const classrooms = demoDataRef.current.classrooms;
      // If no classroomId provided, return first classroom
      if (!classroomId) {
        return Promise.resolve(classrooms.length > 0 ? { ...classrooms[0] } : null);
      }
      const classroom = classrooms.find(c => c.classroomId === id);
      return Promise.resolve(classroom ? { ...classroom } : null);
    },

    getClassrooms: () => Promise.resolve([...demoDataRef.current.classrooms]),

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
        classrooms: [...prev.classrooms, newClassroom],
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
        classrooms: [...prev.classrooms, newClassroom],
      }));
      return Promise.resolve(newClassroom);
    },

    updateClassroom: (username, classroomId, data) => {
      const id = typeof classroomId === 'string' ? parseInt(classroomId, 10) : classroomId;
      let updatedClassroom;
      setDemoData(prev => {
        const newClassrooms = prev.classrooms.map(c => {
          if (c.classroomId === id) {
            updatedClassroom = { ...c, ...data };
            return updatedClassroom;
          }
          return c;
        });
        return { ...prev, classrooms: newClassrooms };
      });
      return Promise.resolve(updatedClassroom);
    },

    deleteClassroom: (username, classroomId) => {
      const id = typeof classroomId === 'string' ? parseInt(classroomId, 10) : classroomId;
      setDemoData(prev => ({
        ...prev,
        classrooms: prev.classrooms.filter(c => c.classroomId !== id),
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
      const currentCharts = demoDataRef.current.seatingCharts;
      const maxNumber = currentCharts.length > 0
        ? Math.max(...currentCharts.map(c => c.number || 0))
        : 0;
      const newChart = {
        seatingChartId: Date.now(),
        classroomId,
        number: maxNumber + 1,
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

    duplicateSeatingChart: (username, classroomId, seatingChartId, label) => {
      const id = typeof seatingChartId === 'string' ? parseInt(seatingChartId, 10) : seatingChartId;
      const original = demoDataRef.current.seatingCharts.find(c => c.seatingChartId === id);
      if (!original) return Promise.resolve(null);

      const newChart = {
        ...original,
        seatingChartId: Date.now(),
        label: label || `Copy of ${original.label || 'Chart'}`,
        createdAt: new Date().toISOString(),
      };
      setDemoData(prev => ({
        ...prev,
        seatingCharts: [newChart, ...prev.seatingCharts],
      }));
      return Promise.resolve(newChart);
    },

    getConstraints: (username, periodId) => {
      const id = typeof periodId === 'string' ? parseInt(periodId, 10) : periodId;
      const list = demoDataRef.current.constraints[id] || [];
      return Promise.resolve(list.map((c) => ({ ...c })));
    },

    createConstraint: (username, periodId, data) => {
      const id = typeof periodId === 'string' ? parseInt(periodId, 10) : periodId;
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
      const pid = typeof periodId === 'string' ? parseInt(periodId, 10) : periodId;
      const cid = typeof constraintId === 'string' ? parseInt(constraintId, 10) : constraintId;
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
