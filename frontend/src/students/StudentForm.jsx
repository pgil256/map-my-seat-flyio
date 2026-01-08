import React, { useState, useContext, useEffect } from "react";
import { useParams } from "react-router-dom";
import SeatingApi from "../api.js";
import LoadingSpinner from "../common/LoadingSpinner";
import UserContext from "../auth/UserContext";
import MakeAlert from "../common/MakeAlert";
import EmptyState from "../common/EmptyState";
import Papa from "papaparse";


import {
  Box,
  Flex,
  Heading,
  Center,
  Stack,
  SimpleGrid,
  Text,
  Button,
  Collapse,
  FormLabel,
  Card,
  CardBody,
  Input,
  Spacer,
  RadioGroup,
  Radio,
  Checkbox,
} from "@chakra-ui/react";

//Allows for student crud operations
const StudentForm = () => {
  const { currentUser } = useContext(UserContext);
  const username = currentUser.username;
  const { periodId } = useParams();
  const [infoLoading, setInfoLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState({});
  const [formErrors, setFormErrors] = useState([]);
  const [saveConfirmed, setSaveConfirmed] = useState(false);
  const [newStudent, setNewStudent] = useState({});
  const [csvData, setCsvData] = useState(null);
  const [allCardsExpanded, setAllCardsExpanded] = useState(false); // Now a boolean

  //On page render, retrieve all students associated with this period
  useEffect(() => {
    async function getStudentsOnMount() {
      if (infoLoading) {
        try {
          let students = await SeatingApi.getPeriod(username, periodId);
          setStudents(students);
          setNewStudent({});
        } catch (error) {
          if (!students) {
            console.error(
              `Students from period with id of ${periodId} could not be retrieved`
            );
            return;
          }
        }
      }
      setInfoLoading(false);
    }
    getStudentsOnMount();
  }, []);

  //Update each student who had any attributes changed
  async function updateStudent(e) {
    e.preventDefault();
    let studentId = parseInt(selectedStudent.studentId);

    const data = {
      studentId: studentId,
      name: selectedStudent.name,
      grade: parseInt(selectedStudent.grade),
      gender: selectedStudent.gender,
      isESE: !!selectedStudent.isESE,
      has504: !!selectedStudent.has504,
      isELL: !!selectedStudent.isELL,
      isEBD: !!selectedStudent.isEBD,
    };

    try {
      const updatedStudent = await SeatingApi.updateStudent(
        username,
        periodId,
        studentId,
        data
      );
      await new Promise((resolve) => setTimeout(resolve, 0));

      setStudents((prevStudents) => {
        const index = prevStudents.findIndex(
          (student) => student.studentId === updatedStudent.studentId
        );
        if (index !== -1) {
          const newStudents = [...prevStudents];
          newStudents[index] = updatedStudent;
          setSelectedStudent({});
          // setIsEditMode(false);
          return newStudents;
        }
        return prevStudents;
      });
    } catch (err) {
      setFormErrors(err);
    }

    setFormErrors([]);
    setSaveConfirmed(true);
  }

  //Delete existing student
  async function deleteStudent(e) {
    e.preventDefault();

    let studentId = parseInt(selectedStudent.studentId);

    try {
      await SeatingApi.deleteStudent(username, periodId, studentId);
      await new Promise((resolve) => setTimeout(resolve, 0));

      setStudents((s) => s.filter((s) => s.studentId !== studentId));
      setSelectedStudent({});
      setSaveConfirmed(true);
    } catch (error) {
      setFormErrors([error.message]);
    }
  }

  //Create new student
  async function createStudent(e) {
    e.preventDefault();

    let data = {
      periodId: parseInt(periodId),
      name: newStudent.name,
      grade: parseInt(newStudent.grade),
      gender: newStudent.gender,
      isESE: !!newStudent.isESE,
      has504: !!newStudent.has504,
      isELL: !!newStudent.isELL,
      isEBD: !!newStudent.isEBD,
    };

    try {
      let addedStudent = await SeatingApi.createStudent(
        username,
        periodId,
        data
      );
      await new Promise((resolve) => setTimeout(resolve, 0));

      if (addedStudent) {
        setStudents([...students, addedStudent]);
        setNewStudent({
          name: "",
          grade: "",
          gender: "",
          isESE: false,
          has504: false,
          isELL: false,
          isEBD: false,
        });
      }
    } catch (err) {
      return setFormErrors(err);
    }

    setFormErrors([]);
    setSaveConfirmed(true);
  }

  const handleCSVChange = (e) => {
    let file = e.target.files[0];
    Papa.parse(file, {
      complete: (result) => {
        setCsvData(result.data);
      },
      header: true,
    });
  };

  const calculateGradeAverage = (student) => {
    let total = 0;
    let count = 0;

    Object.keys(student).forEach((key) => {
      if (key.includes("Assignment")) {
        total += parseInt(student[key]);
        count++;
      }
    });

    return count ? parseInt(total / count) : 0;
  };

  const handleCSVSubmit = async (e) => {
    e.preventDefault();

    if (!csvData) {
      return;
    }

    for (let row of csvData) {
      let data = {
        periodId: parseInt(periodId),
        name: row["Student Name"],
        grade: calculateGradeAverage(row),
        gender: row["Gender"] || "null",
        isESE: row["isESE"] ? !!row["isESE"] : false,
        has504: row["has504"] ? !!row["has504"] : false,
        isELL: row["isELL"] ? !!row["isELL"] : false,
        isEBD: row["isEBD"] ? !!row["isEBD"] : false,
      };

      try {
        let addedStudent = await SeatingApi.createStudent(
          username,
          periodId,
          data
        );
        if (addedStudent) {
          setStudents((prev) => [...prev, addedStudent]);
        }
      } catch (err) {
        return setFormErrors([...formErrors, err]);
      }
    }
    setSaveConfirmed(true);
  };

  const handleCardClick = () => {
    setAllCardsExpanded(!allCardsExpanded); // toggle the boolean value
  };

  if (infoLoading) {
    return <LoadingSpinner />;
  }

  return (
    <>
      <Flex>
        <Flex flexDirection="column" w="35%">
          <Card vh="90%" mt={2}>
            <CardBody mt={1} p={0}>
              <Center>
                <Heading mb={2} p={2} size="lg" noOfLines={1}>
                  Add New Student
                </Heading>
              </Center>
              <Center>
                <Stack spacing={0}>
                  <Flex alignItems="center">
                    <FormLabel htmlFor="newStudentName">Name:</FormLabel>
                    <Input
                      mb={1}
                      type="text"
                      name="name"
                      value={newStudent.name}
                      onChange={(e) =>
                        setNewStudent({ ...newStudent, name: e.target.value })
                      }
                    />
                  </Flex>
                  <Flex alignItems="center">
                    <FormLabel htmlFor="grade">Grade:</FormLabel>
                    <Input
                      type="number"
                      name="grade"
                      value={newStudent.grade}
                      min={0}
                      max={100}
                      onChange={(e) =>
                        setNewStudent({ ...newStudent, grade: e.target.value })
                      }
                    />
                    <Center>
                      <Stack direction="row" m={2}>
                        <FormLabel htmlFor="M">Male</FormLabel>
                        <Radio
                          type="radio"
                          name="gender"
                          value="M"
                          checked={newStudent.gender === "M"}
                          onChange={(e) =>
                            setNewStudent({
                              ...newStudent,
                              gender: e.target.value,
                            })
                          }
                        />

                        <FormLabel htmlFor="F">Female:</FormLabel>
                        <Radio
                          type="radio"
                          name="gender"
                          value="F"
                          checked={newStudent.gender === "F"}
                          onChange={(e) =>
                            setNewStudent({
                              ...newStudent,
                              gender: e.target.value,
                            })
                          }
                        />
                      </Stack>
                    </Center>
                  </Flex>

                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <Stack direction="row" m={2}>
                      <FormLabel htmlFor="ESE">ESE</FormLabel>
                      <Checkbox
                        type="checkbox"
                        name="isESE"
                        checked={newStudent.isESE}
                        onChange={(e) =>
                          setNewStudent({
                            ...newStudent,
                            isESE: e.target.checked,
                          })
                        }
                      />
                      <FormLabel htmlFor="504">504</FormLabel>
                      <Checkbox
                        type="checkbox"
                        name="has504"
                        checked={newStudent.has504}
                        onChange={(e) =>
                          setNewStudent({
                            ...newStudent,
                            has504: e.target.checked,
                          })
                        }
                      />

                      <FormLabel htmlFor="ELL">ELL</FormLabel>
                      <Checkbox
                        type="checkbox"
                        name="isELL"
                        checked={newStudent.isELL}
                        onChange={(e) =>
                          setNewStudent({
                            ...newStudent,
                            isELL: e.target.checked,
                          })
                        }
                      />

                      <FormLabel htmlFor="EBD">EBD</FormLabel>
                      <Checkbox
                        type="checkbox"
                        name="isEBD"
                        checked={newStudent.isEBD}
                        onChange={(e) =>
                          setNewStudent({
                            ...newStudent,
                            isEBD: e.target.checked,
                          })
                        }
                      />
                    </Stack>
                  </Box>
                  <Center>
                    <Button
                      w="50%"
                      m={2}
                      colorScheme="blue"
                      onClick={createStudent}
                    >
                      Add Student
                    </Button>
                  </Center>

                  {formErrors.length ? <MakeAlert messages={formErrors} /> : null}
                  {saveConfirmed.length ? (
                    <MakeAlert messages={saveConfirmed} />
                  ) : null}
                </Stack>
              </Center>
            </CardBody>
            <CardBody flexShrink={0}>
              <Center>
                <Heading mb={2} p={0} size="lg" noOfLines={1}>
                  Update Student
                </Heading>
              </Center>
              <Center>
                <Stack spacing={2} m={0}>
                  <form>
                    <Flex alignItems="center">
                      <FormLabel htmlFor="name">Name:</FormLabel>
                      <Input
                        type="text"
                        name="name"
                        value={selectedStudent ? selectedStudent.name : ""}
                        onChange={(e) =>
                          setSelectedStudent({
                            ...selectedStudent,
                            name: e.target.value,
                          })
                        }
                      />
                    </Flex>

                    <Flex alignItems="center">
                      <FormLabel htmlFor="grade">Grade:</FormLabel>
                      <Input
                        type="number"
                        name="grade"
                        value={selectedStudent ? selectedStudent.grade : ""}
                        min={0}
                        max={100}
                        onChange={(e) =>
                          setSelectedStudent({
                            ...selectedStudent,
                            grade: parseInt(e.target.value),
                          })
                        }
                      />
                      <RadioGroup>
                        <Stack direction="row" m={2}>
                          <FormLabel htmlFor="M">Male</FormLabel>
                          <Radio
                            type="radio"
                            name="gender"
                            value="M"
                            checked={
                              selectedStudent && selectedStudent.gender === "M"
                            }
                            onChange={() =>
                              setSelectedStudent(
                                selectedStudent
                                  ? { ...selectedStudent, gender: "M" }
                                  : null
                              )
                            }
                          />

                          <FormLabel htmlFor="F">Female:</FormLabel>
                          <Radio
                            type="radio"
                            name="gender"
                            value="F"
                            checked={
                              selectedStudent && selectedStudent.gender === "F"
                            }
                            onChange={() =>
                              selectedStudent
                                ? { ...selectedStudent, gender: "F" }
                                : null
                            }
                          />
                        </Stack>
                      </RadioGroup>
                    </Flex>
                    <Stack direction="row" m={2}>
                      <FormLabel htmlFor="ESE">ESE</FormLabel>
                      <Checkbox
                        type="checkbox"
                        name="isESE"
                        value="true"
                        checked={
                          selectedStudent ? selectedStudent.isESE : false
                        }
                        onChange={() =>
                          setSelectedStudent({
                            ...selectedStudent,
                            isESE: !selectedStudent.isESE,
                          })
                        }
                      />

                      <FormLabel htmlFor="504">504</FormLabel>
                      <Checkbox
                        type="checkbox"
                        name="has504"
                        value="true"
                        checked={
                          selectedStudent ? selectedStudent.has504 : false
                        }
                        onChange={() =>
                          setSelectedStudent({
                            ...selectedStudent,
                            has504: !selectedStudent.has504,
                          })
                        }
                      />

                      <FormLabel htmlFor="ELL">ELL</FormLabel>
                      <Checkbox
                        type="checkbox"
                        name="isELL"
                        value="true"
                        checked={
                          selectedStudent ? selectedStudent.isELL : false
                        }
                        onChange={() =>
                          setSelectedStudent({
                            ...selectedStudent,
                            isELL: !selectedStudent.isELL,
                          })
                        }
                      />

                      <FormLabel htmlFor="EBD">EBD</FormLabel>
                      <Checkbox
                        type="checkbox"
                        name="isEBD"
                        value="true"
                        checked={
                          selectedStudent ? selectedStudent.isEBD : false
                        }
                        onChange={() =>
                          setSelectedStudent({
                            ...selectedStudent,
                            isEBD: !selectedStudent.isEBD,
                          })
                        }
                      />
                    </Stack>
                    <Button
                      m={2}
                      colorScheme="blue"
                      type="button"
                      name="updateStudent"
                      onClick={(e) => updateStudent(e)}
                    >
                      Save Changes
                    </Button>

                    <Button
                      m={2}
                      colorScheme="blue"
                      type="button"
                      name="deleteStudent"
                      onClick={(e) => deleteStudent(e)}
                    >
                      Delete Student
                    </Button>

                    {formErrors.length ? <MakeAlert messages={formErrors} /> : null}
                    {saveConfirmed.length ? (
                      <MakeAlert messages={saveConfirmed} />
                    ) : null}
                  </form>
                </Stack>
              </Center>
            </CardBody>
          </Card>
        </Flex>
        <Card w="63%" m={1} p={1} id="studentContainer">
          <Center>
            <Box m={1} p={1} flex="1">
              <Center>
                <Heading>Add Student Rosters</Heading>
              </Center>
              <Text mt={2} fontSize="md">
                Use this page to enter students for this particular seciton. Add
                Students using the "Add Students" form, or by importing CSV
                files. Student info can be viewed and modified by clicking on
                their name and making changes in the "Edit Changes" form.
              </Text>
              <Flex direction="row" width="full" mt={5}>
                <Spacer />
                <Button mr={40} onClick={() => handleCardClick()}>
                  Expand Student List
                </Button>
                <Input
                  w="240px"
                  h="32px"
                  type="file"
                  onChange={handleCSVChange}
                  accept=".csv"
                />
                <Stack>
                  <Button colorScheme="blue" ml={4} onClick={handleCSVSubmit}>
                    Submit CSV file
                  </Button>
                  {saveConfirmed && (
                    <Box>
                      <p>Students added successfully!</p>
                    </Box>
                  )}
                </Stack>
              </Flex>
            </Box>
          </Center>
          <CardBody>
            {students && students.length === 0 ? (
              <EmptyState
                title="No students yet"
                description="Add students individually using the form, or upload a CSV file with your class roster."
                actionLabel="Add First Student"
                onAction={() => document.querySelector('input[name="name"]')?.focus()}
              />
            ) : (
              <Box overflowY={"auto"} maxHeight="280px">
                <SimpleGrid columns={5} spacing={2}>
                  {students.map((student) => (
                    <React.Fragment key={student.studentId}>
                      <Flex py={5} position="relative">
                        <Box
                          maxW={"510px"}
                          w={"full"}
                          bg={"white"}
                          boxShadow={"2xl"}
                          rounded={"lg"}
                          p={5}
                          textAlign={"center"}
                        >
                          <Heading
                            fontSize={"2xl"}
                            fontFamily={"body"}
                            style={{ cursor: "pointer" }}
                          >
                            {student.name}
                          </Heading>
                          <Collapse in={allCardsExpanded}>
                            <>
                              <Center>
                                <Stack
                                  fontWeight={600}
                                  fontSize={"sm"}
                                  color={"gray.500"}
                                  m={1}
                                  mt={2}
                                  w="350px"
                                >
                                  <SimpleGrid spacing={1} columns={2}>
                                    <Text>Grade: {student.grade}</Text>
                                    <Text>M/F: {student.gender}</Text>
                                    <Text>
                                      ESE: {student.isESE ? "Yes" : "No"}
                                    </Text>
                                    <Text>
                                      504: {student.has504 ? "Yes" : "No"}
                                    </Text>
                                    <Text>
                                      ELL: {student.isELL ? "Yes" : "No"}
                                    </Text>
                                    <Text>
                                      EBD: {student.isEBD ? "Yes" : "No"}
                                    </Text>
                                  </SimpleGrid>
                                </Stack>
                              </Center>
                              <Stack mt={4} direction={"row"} spacing={4}>
                                <Button
                                  onClick={() => setSelectedStudent(student)}
                                  flex={1}
                                  fontSize={"sm"}
                                  rounded={"full"}
                                  _focus={{
                                    bg: "gray.200",
                                  }}
                                >
                                  Edit Student
                                </Button>
                              </Stack>
                            </>
                          </Collapse>
                        </Box>
                      </Flex>
                    </React.Fragment>
                  ))}
                </SimpleGrid>
              </Box>
            )}
          </CardBody>
        </Card>
      </Flex>
    </>
  );
};

export default StudentForm;
