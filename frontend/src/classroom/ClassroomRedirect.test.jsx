import React from "react";
import { mount } from "enzyme";
import ClassroomRedirect from "./ClassroomRedirect";

describe("ClassroomRedirect", () => {
  let wrapper;

  beforeEach(() => {
    wrapper = mount(<ClassroomRedirect />);
  });

  afterEach(() => {
    wrapper.unmount();
  });

  it("renders the 'Create Seating Chart' message", () => {
    expect(wrapper.text()).toContain("Create Seating Chart:");
  });

  it("displays a loading spinner initially", () => {
    const loadingSpinner = wrapper.find("LoadingSpinner");
    expect(loadingSpinner).toHaveLength(1);
  });

  it("renders period buttons after fetching data", async () => {
    await new Promise((resolve) => setTimeout(resolve)); 
    wrapper.update();

    const periods = [
      { number: 1 },
      { number: 2 },
      { number: 3 },
      { number: 4 },
    ];

    expect(wrapper.text()).not.toContain("No periods added yet");

    periods.forEach((period) => {
      const button = wrapper.find(`button[value="${period.number}"]`);
      expect(button).toHaveLength(1);
      expect(button.text()).toContain(`Period ${period.number}`);
    });
  });

  it("redirects to seating chart page when a button is clicked", async () => {
    await new Promise((resolve) => setTimeout(resolve)); 
    wrapper.update();

    const button = wrapper.find("button").first();
    button.simulate("click");

    expect(window.location.pathname).toMatch("/classrooms/.*/seating-charts/.*");
  });
});
