import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import AppRouter from "./AppRouter";
import Home from "../home/Home";
import ClassroomForm from "../classroom/ClassroomForm";
import StudentForm from "../students/StudentForm";
import LoginForm from "../auth/LoginForm";
import PeriodForm from "../periods/PeriodForm";
import SeatingChart from "../seating/SeatingChart";
import SignupForm from "../auth/SignupForm";
import ProfileForm from "../profile/ProfileForm";

describe("AppRouter", () => {
  it("renders Home component for / route", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <AppRouter />
      </MemoryRouter>
    );

    expect(screen.getByText("Home")).toBeInTheDocument();
  });

  it("renders LoginForm component for /login route", () => {
    render(
      <MemoryRouter initialEntries={["/login"]}>
        <AppRouter />
      </MemoryRouter>
    );

    expect(screen.getByText("Login Form")).toBeInTheDocument();
  });

  it("renders SignupForm component for /signup route", () => {
    render(
      <MemoryRouter initialEntries={["/signup"]}>
        <AppRouter />
      </MemoryRouter>
    );

    expect(screen.getByText("Signup Form")).toBeInTheDocument();
  });

  it("renders PeriodForm component for /periods route", () => {
    render(
      <MemoryRouter initialEntries={["/periods"]}>
        <AppRouter />
      </MemoryRouter>
    );

    expect(screen.getByText("Period Form")).toBeInTheDocument();
  });

  it("renders StudentForm component for /periods/:periodId route", () => {
    render(
      <MemoryRouter initialEntries={["/periods/1"]}>
        <AppRouter />
      </MemoryRouter>
    );

    expect(screen.getByText("Student Form")).toBeInTheDocument();
  });

  it("renders ClassroomForm component for /classrooms route", () => {
    render(
      <MemoryRouter initialEntries={["/classrooms"]}>
        <AppRouter />
      </MemoryRouter>
    );

    expect(screen.getByText("Classroom Form")).toBeInTheDocument();
  });

  it("renders SeatingChart component for /classrooms/:classroomId/seating-charts/:number route", () => {
    render(
      <MemoryRouter initialEntries={["/classrooms/1/seating-charts/1"]}>
        <AppRouter />
      </MemoryRouter>
    );

    expect(screen.getByText("Seating Chart")).toBeInTheDocument();
  });

  it("renders ProfileForm component for /profile route", () => {
    render(
      <MemoryRouter initialEntries={["/profile"]}>
        <AppRouter />
      </MemoryRouter>
    );

    expect(screen.getByText("Profile Form")).toBeInTheDocument();
  });
});
