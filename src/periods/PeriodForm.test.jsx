describe("ClassroomForm", () => {
  let wrapper;
  const currentUser = { username: "testuser" };
  const useClassroomSpy = jest.spyOn(SeatingApi, "getClassroom");
  const createClassroomSpy = jest.spyOn(SeatingApi, "createClassroom");
  const updateClassroomSpy = jest.spyOn(SeatingApi, "updateClassroom");

  beforeEach(() => {
    //Reset all mock implementation and state
    jest.clearAllMocks();
    currentUser.username = "testuser";
    useContext.mockReturnValue({ currentUser });
    wrapper = shallow(<ClassroomForm />);
  });

  it("should render a loading spinner initially when infoLoading is true", () => {   
    wrapper.setState({ infoLoading: true });    
    expect(wrapper.exists(LoadingSpinner)).toBeTruthy();
  });

  it("should render the classroom form when infoLoading is false and classroom exists", async () => {
    useClassroomSpy.mockResolvedValue({
      classroomId: "testid",
      seatAlphabetical: true,
      seatRandomize: false,
      seatHighLow: false,
      seatMaleFemale: false,
      eseIsPriority: false,
      ellIsPriority: false,
      fiveZeroFourIsPriority: true,
      ebdIsPriority: true,
    });

    await Promise.resolve();
    expect(wrapper.exists("form")).toBeTruthy();
    expect(wrapper.exists(Alert)).toBeFalsy();
    expect(wrapper.exists(ClassroomRedirect)).toBeTruthy();
    expect(wrapper.exists(Classroom)).toBeTruthy();
  });

  it("should render an alert when saveConfirmed is truthy", async () => {
    useClassroomSpy.mockResolvedValue({
      classroomId: "testid",
      seatAlphabetical: true,
      seatRandomize: false,
      seatHighLow: false,
      seatMaleFemale: false,
      eseIsPriority: false,
      ellIsPriority: false,
      fiveZeroFourIsPriority: true,
      ebdIsPriority: true,
    });

    await Promise.resolve();
    wrapper.setState({ saveConfirmed: ["Changes saved successfully"] });
    
    expect(wrapper.exists(Alert)).toBeTruthy();
    expect(wrapper.find(Alert).prop("messages")).toEqual(["Changes saved successfully"]);
  });

  it("should render an error message if SeatingApi.createOrGetClassroom() fails", async () => {
    createClassroomSpy.mockRejectedValue(new Error("Unable to create classroom"));

    await Promise.resolve();

    expect(wrapper.exists(Alert)).toBeTruthy();
    expect(wrapper.find(Alert).prop("messages")).toEqual(["Error while retrieving or creating classroom: Unable to create classroom"]);
  });

  it("should update form data state when handleChange is called on an input", () => {    
    const event = { target: { name: "eseIsPriority", type: "checkbox", checked: true, value: undefined } };
    wrapper.instance().handleChange(event);    
    expect(wrapper.state("formData").eseIsPriority).toBe(true);
  });

  it("should call SeatingApi.updateClassroom() with the correct arguments on form submission", async () => {
    useClassroomSpy.mockResolvedValue({
      classroomId: "testid",
      seatAlphabetical: true,
      seatRandomize: false,
      seatHighLow: false,
      seatMaleFemale: false,
      eseIsPriority: false,
      ellIsPriority: false,
      fiveZeroFourIsPriority: true,
      ebdIsPriority: true,
    });

    await Promise.resolve();
    const preventDefaultSpy = jest.spyOn(Event.prototype, "preventDefault");
    wrapper.find("form").simulate("submit", new Event(""));
   
    expect(preventDefaultSpy).toHaveBeenCalled();
    expect(updateClassroomSpy).toHaveBeenCalledWith(currentUser.username, "testid", {
      seatAlphabetical: true,
      seatRandomize: false,
      seatHighLow: false,
      seatMaleFemale: false,
      eseIsPriority: false,
      ellIsPriority: false,
      fiveZeroFourIsPriority: true,
      ebdIsPriority: true,
      seatingConfig: null,
    });
  });

});
