import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import axios from "axios";
import SeatingApi, { ApiError } from "./api";

// Mock axios
vi.mock("axios");

describe("SeatingApi", () => {
  beforeEach(() => {
    SeatingApi.token = "test-token";
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("ApiError", () => {
    it("creates an error with all properties", () => {
      const error = new ApiError("Test message", "TEST_CODE", 400, { field: "value" });
      expect(error.message).toBe("Test message");
      expect(error.code).toBe("TEST_CODE");
      expect(error.status).toBe(400);
      expect(error.details).toEqual({ field: "value" });
      expect(error.name).toBe("ApiError");
    });

    it("creates an error without details", () => {
      const error = new ApiError("Test message", "TEST_CODE", 500);
      expect(error.details).toBeNull();
    });
  });

  describe("request", () => {
    it("makes a GET request with correct headers", async () => {
      axios.mockResolvedValue({ data: { success: true } });

      const result = await SeatingApi.request("/test");

      expect(axios).toHaveBeenCalledWith({
        url: expect.stringContaining("/test"),
        method: "get",
        data: {},
        params: {},
        headers: {
          Authorization: "Bearer test-token",
          "Content-Type": "application/json",
        },
      });
      expect(result).toEqual({ success: true });
    });

    it("makes a POST request with data in body", async () => {
      axios.mockResolvedValue({ data: { created: true } });

      const result = await SeatingApi.request("/test", { name: "test" }, "post");

      expect(axios).toHaveBeenCalledWith({
        url: expect.stringContaining("/test"),
        method: "post",
        data: { name: "test" },
        params: {},
        headers: expect.any(Object),
      });
      expect(result).toEqual({ created: true });
    });

    it("throws ApiError for network errors", async () => {
      axios.mockRejectedValue({ response: null });

      await expect(SeatingApi.request("/test")).rejects.toThrow(ApiError);
      await expect(SeatingApi.request("/test")).rejects.toMatchObject({
        code: "NETWORK_ERROR",
        status: 0,
      });
    });

    it("throws ApiError for standardized error format", async () => {
      axios.mockRejectedValue({
        response: {
          status: 400,
          data: {
            error: "Validation failed",
            code: "VALIDATION_ERROR",
            details: { field: "username" },
          },
        },
      });

      await expect(SeatingApi.request("/test")).rejects.toMatchObject({
        message: "Validation failed",
        code: "VALIDATION_ERROR",
        status: 400,
        details: { field: "username" },
      });
    });

    it("handles legacy error format", async () => {
      axios.mockRejectedValue({
        response: {
          status: 401,
          data: {
            error: { message: "Invalid credentials" },
          },
        },
      });

      await expect(SeatingApi.request("/test")).rejects.toMatchObject({
        message: "Invalid credentials",
        code: "LEGACY_ERROR",
        status: 401,
      });
    });

    it("handles legacy error format with array message", async () => {
      axios.mockRejectedValue({
        response: {
          status: 400,
          data: {
            error: { message: ["Error 1", "Error 2"] },
          },
        },
      });

      await expect(SeatingApi.request("/test")).rejects.toMatchObject({
        message: "Error 1, Error 2",
        code: "LEGACY_ERROR",
      });
    });

    it("handles unknown error format", async () => {
      axios.mockRejectedValue({
        response: {
          status: 500,
          data: {},
        },
      });

      await expect(SeatingApi.request("/test")).rejects.toMatchObject({
        message: "An unexpected error occurred",
        code: "UNKNOWN_ERROR",
        status: 500,
      });
    });
  });

  describe("Auth methods", () => {
    it("getCurrentUser fetches user data", async () => {
      axios.mockResolvedValue({ data: { user: { username: "testuser" } } });

      const user = await SeatingApi.getCurrentUser("testuser");

      expect(axios).toHaveBeenCalledWith(
        expect.objectContaining({
          url: expect.stringContaining("/users/testuser"),
          method: "get",
        })
      );
      expect(user).toEqual({ username: "testuser" });
    });

    it("signup posts registration data and returns token", async () => {
      axios.mockResolvedValue({ data: { token: "new-token" } });

      const token = await SeatingApi.signup({ username: "newuser", password: "pass" });

      expect(axios).toHaveBeenCalledWith(
        expect.objectContaining({
          url: expect.stringContaining("/auth/register"),
          method: "post",
          data: { username: "newuser", password: "pass" },
        })
      );
      expect(token).toBe("new-token");
    });

    it("login posts credentials and returns token", async () => {
      axios.mockResolvedValue({ data: { token: "login-token" } });

      const token = await SeatingApi.login({ username: "user", password: "pass" });

      expect(axios).toHaveBeenCalledWith(
        expect.objectContaining({
          url: expect.stringContaining("/auth/token"),
          method: "post",
        })
      );
      expect(token).toBe("login-token");
    });

    it("saveUserProfile patches user data", async () => {
      axios.mockResolvedValue({ data: { user: { firstName: "Updated" } } });

      const user = await SeatingApi.saveUserProfile("testuser", { firstName: "Updated" });

      expect(axios).toHaveBeenCalledWith(
        expect.objectContaining({
          url: expect.stringContaining("/users/testuser"),
          method: "patch",
        })
      );
      expect(user).toEqual({ firstName: "Updated" });
    });
  });

  describe("Period methods", () => {
    it("createPeriod posts period data", async () => {
      axios.mockResolvedValue({ data: { period: { periodId: 1 } } });

      const period = await SeatingApi.createPeriod("user1", { title: "Period 1" });

      expect(axios).toHaveBeenCalledWith(
        expect.objectContaining({
          url: expect.stringContaining("/periods/user1"),
          method: "post",
        })
      );
      expect(period).toEqual({ periodId: 1 });
    });

    it("getPeriods fetches all periods for user", async () => {
      axios.mockResolvedValue({ data: { periods: [{ periodId: 1 }, { periodId: 2 }] } });

      const periods = await SeatingApi.getPeriods("user1");

      expect(periods).toHaveLength(2);
    });

    it("getPeriod fetches a single period", async () => {
      axios.mockResolvedValue({ data: { period: { periodId: 1, title: "Test" } } });

      const period = await SeatingApi.getPeriod("user1", 1);

      expect(axios).toHaveBeenCalledWith(
        expect.objectContaining({
          url: expect.stringContaining("/periods/user1/1"),
        })
      );
      expect(period.title).toBe("Test");
    });

    it("updatePeriod patches period data", async () => {
      axios.mockResolvedValue({ data: { period: { title: "Updated" } } });

      const period = await SeatingApi.updatePeriod("user1", 1, { title: "Updated" });

      expect(axios).toHaveBeenCalledWith(
        expect.objectContaining({
          method: "patch",
        })
      );
      expect(period.title).toBe("Updated");
    });

    it("deletePeriod deletes a period", async () => {
      axios.mockResolvedValue({ data: { periodId: 1 } });

      const result = await SeatingApi.deletePeriod("user1", 1);

      expect(axios).toHaveBeenCalledWith(
        expect.objectContaining({
          method: "delete",
        })
      );
      expect(result).toBe(1);
    });
  });

  describe("Student methods", () => {
    it("createStudent posts student data", async () => {
      axios.mockResolvedValue({ data: { student: { studentId: 1, name: "John" } } });

      const student = await SeatingApi.createStudent("user1", 1, { name: "John" });

      expect(axios).toHaveBeenCalledWith(
        expect.objectContaining({
          url: expect.stringContaining("/periods/user1/1/students"),
          method: "post",
        })
      );
      expect(student.name).toBe("John");
    });

    it("updateStudent patches student data", async () => {
      axios.mockResolvedValue({ data: { student: { name: "Jane" } } });

      const student = await SeatingApi.updateStudent("user1", 1, 5, { name: "Jane" });

      expect(axios).toHaveBeenCalledWith(
        expect.objectContaining({
          url: expect.stringContaining("/periods/user1/1/students/5"),
          method: "patch",
        })
      );
      expect(student.name).toBe("Jane");
    });

    it("deleteStudent removes a student", async () => {
      axios.mockResolvedValue({ data: { studentId: 5 } });

      const result = await SeatingApi.deleteStudent("user1", 1, 5);

      expect(axios).toHaveBeenCalledWith(
        expect.objectContaining({
          method: "delete",
        })
      );
      expect(result).toBe(5);
    });
  });

  describe("Classroom methods", () => {
    it("getClassroom fetches primary classroom", async () => {
      axios.mockResolvedValue({ data: { classroom: { classroomId: 1 } } });

      const classroom = await SeatingApi.getClassroom("user1");

      expect(classroom.classroomId).toBe(1);
    });

    it("getClassrooms fetches all classrooms", async () => {
      axios.mockResolvedValue({ data: { classrooms: [{ classroomId: 1 }, { classroomId: 2 }] } });

      const classrooms = await SeatingApi.getClassrooms("user1");

      expect(classrooms).toHaveLength(2);
    });

    it("createClassroom creates a new classroom", async () => {
      axios.mockResolvedValue({ data: { classroom: { classroomId: 3 } } });

      const classroom = await SeatingApi.createClassroom("user1");

      expect(axios).toHaveBeenCalledWith(
        expect.objectContaining({
          method: "post",
        })
      );
      expect(classroom.classroomId).toBe(3);
    });

    it("createClassroomWithName creates classroom with name", async () => {
      axios.mockResolvedValue({ data: { classroom: { name: "Room 101" } } });

      const classroom = await SeatingApi.createClassroomWithName("user1", "Room 101");

      expect(axios).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { name: "Room 101" },
        })
      );
      expect(classroom.name).toBe("Room 101");
    });

    it("deleteClassroom removes a classroom", async () => {
      axios.mockResolvedValue({ data: { deleted: true } });

      const result = await SeatingApi.deleteClassroom("user1", 1);

      expect(result).toBe(true);
    });

    it("updateClassroom patches classroom data", async () => {
      axios.mockResolvedValue({ data: { classroom: { name: "Updated Room" } } });

      const classroom = await SeatingApi.updateClassroom("user1", 1, { name: "Updated Room" });

      expect(classroom.name).toBe("Updated Room");
    });
  });

  describe("Seating Chart methods", () => {
    it("createSeatingChart posts chart data", async () => {
      axios.mockResolvedValue({ data: { seatingChart: { seatingChartId: 1 } } });

      const chart = await SeatingApi.createSeatingChart("user1", 1, { arrangement: [] });

      expect(axios).toHaveBeenCalledWith(
        expect.objectContaining({
          url: expect.stringContaining("/classrooms/user1/1/seating-charts"),
          method: "post",
        })
      );
      expect(chart.seatingChartId).toBe(1);
    });

    it("getSeatingCharts fetches all charts for classroom", async () => {
      axios.mockResolvedValue({ data: { seatingCharts: [{ seatingChartId: 1 }] } });

      const charts = await SeatingApi.getSeatingCharts("user1", 1);

      expect(charts).toHaveLength(1);
    });

    it("getSeatingChart fetches a single chart", async () => {
      axios.mockResolvedValue({ data: { seatingChart: { seatingChartId: 1 } } });

      const chart = await SeatingApi.getSeatingChart("user1", 1, 1);

      expect(chart.seatingChartId).toBe(1);
    });

    it("updateSeatingChart patches chart data", async () => {
      axios.mockResolvedValue({ data: { seatingChart: { label: "Updated" } } });

      const chart = await SeatingApi.updateSeatingChart("user1", 1, 1, { label: "Updated" });

      expect(chart.label).toBe("Updated");
    });

    it("deleteSeatingChart removes a chart", async () => {
      axios.mockResolvedValue({ data: { seatingChart: { number: 1 } } });

      const result = await SeatingApi.deleteSeatingChart("user1", 1, 1);

      expect(result).toBe(1);
    });

    it("duplicateSeatingChart creates a copy", async () => {
      axios.mockResolvedValue({ data: { seatingChart: { seatingChartId: 2, label: "Copy" } } });

      const chart = await SeatingApi.duplicateSeatingChart("user1", 1, 1, "Copy");

      expect(axios).toHaveBeenCalledWith(
        expect.objectContaining({
          url: expect.stringContaining("/duplicate"),
          data: { label: "Copy" },
        })
      );
      expect(chart.label).toBe("Copy");
    });
  });

  describe("Constraint methods", () => {
    it("getConstraints fetches all constraints for period", async () => {
      axios.mockResolvedValue({ data: { constraints: [{ constraintId: 1 }] } });

      const constraints = await SeatingApi.getConstraints("user1", 1);

      expect(constraints).toHaveLength(1);
    });

    it("createConstraint posts constraint data", async () => {
      axios.mockResolvedValue({ data: { constraint: { constraintId: 1 } } });

      const constraint = await SeatingApi.createConstraint("user1", 1, { type: "APART" });

      expect(axios).toHaveBeenCalledWith(
        expect.objectContaining({
          method: "post",
        })
      );
      expect(constraint.constraintId).toBe(1);
    });

    it("deleteConstraint removes a constraint", async () => {
      axios.mockResolvedValue({ data: {} });

      await SeatingApi.deleteConstraint("user1", 1, 5);

      expect(axios).toHaveBeenCalledWith(
        expect.objectContaining({
          url: expect.stringContaining("/constraints/user1/1/5"),
          method: "delete",
        })
      );
    });
  });
});
