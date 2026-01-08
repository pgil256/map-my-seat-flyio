import axios from "axios";

// Dynamic base URL for different environments
const BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.MODE === "production" ? "/api" : "http://localhost:3001");

// API Error class for structured error handling
export class ApiError extends Error {
  constructor(message, code, status, details = null) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

// Class for interactive API requests
class SeatingApi {
  static token;

  static async request(endpoint, data = {}, method = "get") {
    console.debug("API Call:", endpoint, data, method);

    const url = `${BASE_URL}${endpoint}`;
    const headers = {
      Authorization: `Bearer ${SeatingApi.token}`,
      "Content-Type": "application/json",
    };
    const params = method === "get" ? data : {};

    try {
      return (await axios({ url, method, data, params, headers })).data;
    } catch (err) {
      console.error("API Error:", err.response);

      // Handle network errors
      if (!err.response) {
        throw new ApiError(
          "Unable to connect to server. Please check your internet connection.",
          "NETWORK_ERROR",
          0
        );
      }

      // Extract error details from response
      const { status } = err.response;
      const responseData = err.response.data;

      // Handle new standardized error format
      if (responseData.error && responseData.code) {
        throw new ApiError(
          responseData.error,
          responseData.code,
          status,
          responseData.details
        );
      }

      // Handle legacy error format for backwards compatibility
      if (responseData.error?.message) {
        const message = responseData.error.message;
        throw new ApiError(
          Array.isArray(message) ? message.join(", ") : message,
          "LEGACY_ERROR",
          status
        );
      }

      // Fallback for unknown error format
      throw new ApiError(
        "An unexpected error occurred",
        "UNKNOWN_ERROR",
        status
      );
    }
  }

  // Various routes to send to API

  // Routes related to user
  static async getCurrentUser(username) {
    let res = await this.request(`/users/${username}`);
    return res.user;
  }

  static async signup(data) {
    let res = await this.request("/auth/register", data, "post");
    return res.token;
  }

  static async login(data) {
    let res = await this.request("/auth/token", data, "post");
    return res.token;
  }

  static async saveUserProfile(username, data) {
    let res = await this.request(`/users/${username}`, data, "patch");
    return res.user;
  }

  // Period specific routes

  static async createPeriod(username, data) {
    let res = await this.request(`/periods/${username}`, data, "post");
    return res.period;
  }

  static async getPeriods(username) {
    let res = await this.request(`/periods/${username}`);
    return res.periods;
  }

  static async getPeriod(username, periodId) {
    let res = await this.request(`/periods/${username}/${periodId}`);
    return res.period;
  }

  static async updatePeriod(username, periodId, data) {
    let res = await this.request(
      `/periods/${username}/${periodId}`,
      data,
      "patch"
    );
    return res.period;
  }

  static async deletePeriod(username, periodId) {
    let res = await this.request(
      `/periods/${username}/${periodId}`,
      {},
      "delete"
    );
    return res.periodId;
  }

  // Student specific Routes
  static async createStudent(username, periodId, data) {
    let res = await this.request(
      `/periods/${username}/${periodId}/students`,
      data,
      "post"
    );
    return res.student;
  }

  static async updateStudent(username, periodId, studentId, data) {
    let res = await this.request(
      `/periods/${username}/${periodId}/students/${studentId}`,
      data,
      "patch"
    );
    return res.student;
  }

  static async deleteStudent(username, periodId, studentId) {
    let res = await this.request(
      `/periods/${username}/${periodId}/students/${studentId}`,
      {},
      "delete"
    );
    return res.studentId;
  }

  // Classroom specific routes

  static async getClassroom(username) {
    let res = await this.request(`/classrooms/${username}`);
    return res.classroom;
  }

  static async createClassroom(username) {
    let res = await this.request(`/classrooms/${username}`, {}, "post");
    return res.classroom;
  }

  static async updateClassroom(username, classroomId, data) {
    let res = await this.request(
      `/classrooms/${username}/${classroomId}`,
      data,
      "patch"
    );
    return res.classroom;
  }

  // Seating Chart Specific Routes

  static async createSeatingChart(username, classroomId, data) {
    let res = await this.request(
      `/classrooms/${username}/${classroomId}/seating-charts`,
      data,
      "post"
    );
    return res.seatingChart;
  }

  static async getSeatingCharts(username, classroomId) {
    let res = await this.request(
      `/classrooms/${username}/${classroomId}/seating-charts`
    );
    return res.seatingCharts;
  }

  static async getSeatingChart(username, classroomId, seatingChartId) {
    let res = await this.request(
      `/classrooms/${username}/${classroomId}/seating-charts/${seatingChartId}`
    );
    return res.seatingChart;
  }

  static async updateSeatingChart(username, classroomId, seatingChartId, data) {
    let res = await this.request(
      `/classrooms/${username}/${classroomId}/seating-charts/${seatingChartId}`,
      data,
      "patch"
    );
    return res.seatingChart;
  }

  static async deleteSeatingChart(username, classroomId, seatingChartId) {
    let res = await this.request(
      `/classrooms/${username}/${classroomId}/seating-charts/${seatingChartId}`,
      {},
      "delete"
    );
    return res.seatingChart.number;
  }
}

export default SeatingApi;
