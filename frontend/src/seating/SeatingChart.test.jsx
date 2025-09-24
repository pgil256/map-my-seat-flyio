import React from "react";
import { render } from "@testing-library/react";
import SeatingChart from "../SeatingChart";

jest.mock("react-router-dom", () => ({
  useParams: jest.fn(() => ({ number: 1, classroomId: 1 })),
}));

jest.mock("../auth/UserContext", () => ({
  currentUser: {
    username: "testuser",
  },
}));

jest.mock("../api", () => ({
  getSeatingCharts: jest.fn(() => [
    { id: 1, number: 1 },
    { id: 2, number: 2 },
  ]),
  getSeatingChart: jest.fn(() => ({
    seatingChartData: [],
  })),
}));

describe("SeatingChart Component", () => {
  test("renders successfully", () => {
    render(<SeatingChart />);
  });

  test("useParams returns the correct values", () => {
    const { result } = renderHook(() => useParams());
    expect(result.current).toEqual({ number: 1, classroomId: 1 });
  });

  test("useState hooks initialize to the correct values", () => {
    const { getByText } = render(<SeatingChart />);
    expect(getByText("Loading...")).toBeInTheDocument();
  });

  test("API calls are made correctly", async () => {
    const { getByText } = render(<SeatingChart />);
    expect(getByText("Loading...")).toBeInTheDocument();

    await wait(() => {
      expect(getSeatingCharts).toHaveBeenCalledTimes(1);
    });

    await wait(() => {
      expect(getSeatingChart).toHaveBeenCalledTimes(1);
    });
  });

  test("sort students correctly based on seating preferences", () => {
    const students = [
      { name: "Alice", grade: 5, has504: true, isELL: false, isESE: false },
      { name: "Bob", grade: 4, has504: false, isELL: false, isESE: true },
      { name: "Charlie", grade: 3, has504: false, isELL: true, isESE: false },
      { name: "David", grade: 2, has504: true, isELL: false, isESE: false },
      { name: "Eric", grade: 1, has504: false, isELL: true, isESE: true },
    ];

    const classroom = {
      eseIsPriority: false,
      ellIsPriority: true,
      fiveZeroFourIsPriority: false,
      ebdIsPriority: false,
      seatAlphabetical: false,
      seatRandomize: false,
      seatHighLow: true,
      seatMaleFemale: false,
    };

    const expectedResult = [
      "Alice",
      "David",
      "Bob",
      "Charlie",
      "Eric",
    ];

    const result = getSeatingPreference(students, classroom);

    expect(result).toEqual(expectedResult);
  });
});

jest.mock("../api", () => ({
  getSeatingCharts: jest.fn(() => [
    { id: 1, number: 1 },
    { id: 2, number: 2 },
  ]),
  getSeatingChart: jest.fn(() => ({
    seatingChartData: [],
  })),
}));

describe("SeatingChart Component", () => {
  test("renders successfully", () => {
    render(<SeatingChart />);
  });

  test("useParams returns the correct values", () => {
    const { result } = renderHook(() => useParams());
    expect(result.current).toEqual({ number: 1, classroomId: 1 });
  });

  test("useState hooks initialize to the correct values", () => {
    const { getByText } = render(<SeatingChart />);
    expect(getByText("Loading...")).toBeInTheDocument();
  });

  test("API calls are made correctly", async () => {
    const { getByText } = render(<SeatingChart />);
    expect(getByText("Loading...")).toBeInTheDocument();

    await wait(() => {
      expect(getSeatingCharts).toHaveBeenCalledTimes(1);
    });

    await wait(() => {
      expect(getSeatingChart).toHaveBeenCalledTimes(1);
    });
  });

  test("sort students correctly based on seating preferences", () => {
    const students = [
      { name: "Alice", grade: 5, has504: true, isELL: false, isESE: false },
      { name: "Bob", grade: 4, has504: false, isELL: false, isESE: true },
      { name: "Charlie", grade: 3, has504: false, isELL: true, isESE: false },
      { name: "David", grade: 2, has504: true, isELL: false, isESE: false },
      { name: "Eric", grade: 1, has504: false, isELL: true, isESE: true },
    ];

    const classroom = {
      eseIsPriority: false,
      ellIsPriority: true,
      fiveZeroFourIsPriority: false,
      ebdIsPriority: false,
      seatAlphabetical: false,
      seatRandomize: false,
      seatHighLow: true,
      seatMaleFemale: false,
    };

    const expectedResult = [
      "Alice",
      "David",
      "Bob",
      "Charlie",
      "Eric",
    ];

    const result = getSeatingPreference(students, classroom);

    expect(result).toEqual(expectedResult);
  });
});

