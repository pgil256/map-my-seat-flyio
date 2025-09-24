import React from "react";
import { render } from "@testing-library/react";
import StudentForm from "./StudentForm";

describe("StudentForm", () => {
  it("renders without errors", () => {
    render(<StudentForm />);
  });

  it("deletes an existing student when the delete button is clicked", () => {
    const students = [
      {
        studentId: 1,
        name: "Doe,J",
        grade: "93",
        gender: "M",
        eseIsPriority: true,
      }]
    const { getByLabelText, getByText, queryByText } = render(
      <StudentForm students={students} />
    );
    const deleteButton = getByLabelText("Remove Student");
  });
});
