import React, { useState, useContext, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import useApi from "../hooks/useApi";
import LoadingSpinner from "../common/LoadingSpinner";
import UserContext from "../auth/UserContext";
import MakeAlert from "../common/MakeAlert";
import EmptyState from "../common/EmptyState";
import useKeyboardShortcuts from "../hooks/useKeyboardShortcuts";
import Papa from "papaparse";

import {
  Box,
  Flex,
  Heading,
  Center,
  VStack,
  HStack,
  SimpleGrid,
  Text,
  Button,
  Collapse,
  FormLabel,
  Card,
  CardBody,
  Input,
  Radio,
  Checkbox,
  Badge,
  useColorModeValue,
} from "@chakra-ui/react";

// Accommodation badge component using theme colors
const AccommodationBadge = ({ type, active }) => {
  const colors = {
    ESE: { bg: "accommodation.ese.bg", text: "accommodation.ese.text" },
    "504": { bg: "accommodation.plan504.bg", text: "accommodation.plan504.text" },
    ELL: { bg: "accommodation.ell.bg", text: "accommodation.ell.text" },
    EBD: { bg: "accommodation.ebd.bg", text: "accommodation.ebd.text" },
  };

  if (!active) return null;

  return (
    <Badge
      bg={colors[type].bg}
      color={colors[type].text}
      px={2}
      py={0.5}
      borderRadius="full"
      fontSize="xs"
      fontWeight="medium"
      textTransform="uppercase"
    >
      {type}
    </Badge>
  );
};

//Allows for student crud operations
const StudentForm = () => {
  const { currentUser } = useContext(UserContext);
  const { api } = useApi();
  const username = currentUser.username;
  const { periodId } = useParams();
  const [infoLoading, setInfoLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState({});
  const [formErrors, setFormErrors] = useState([]);
  const [saveConfirmed, setSaveConfirmed] = useState(false);
  const [newStudent, setNewStudent] = useState({});
  const [csvData, setCsvData] = useState(null);
  const [allCardsExpanded, setAllCardsExpanded] = useState(false);

  const headingColor = useColorModeValue("brand.800", "brand.100");
  const textColor = useColorModeValue("brand.600", "brand.300");
  const cardBg = useColorModeValue("white", "brand.800");
  const borderColor = useColorModeValue("brand.200", "brand.700");

  // Reset form function for keyboard shortcut
  const resetForm = useCallback(() => {
    setSelectedStudent({});
    setNewStudent({
      name: "",
      grade: "",
      gender: "",
      isESE: false,
      has504: false,
      isELL: false,
      isEBD: false,
    });
    setFormErrors([]);
    setSaveConfirmed(false);
  }, []);

  // Escape key to cancel editing
  useKeyboardShortcuts([
    {
      key: "Escape",
      handler: resetForm,
    },
  ], [resetForm]);

  //On page render, retrieve all students associated with this period
  useEffect(() => {
    async function getStudentsOnMount() {
      if (infoLoading) {
        try {
          let result = await api.getPeriod(username, periodId);
          setStudents(result?.students || []);
          setNewStudent({});
        } catch (error) {
          console.error(
            `Students from period with id of ${periodId} could not be retrieved`
          );
        }
      }
      setInfoLoading(false);
    }
    getStudentsOnMount();
  }, [api, username, periodId, infoLoading]);

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
      const updatedStudent = await api.updateStudent(
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
      await api.deleteStudent(username, periodId, studentId);
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
      let addedStudent = await api.createStudent(
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
        let addedStudent = await api.createStudent(
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
    setAllCardsExpanded(!allCardsExpanded);
  };

  if (infoLoading) {
    return <LoadingSpinner />;
  }

  return (
    <Flex gap={4} p={2}>
      <Flex flexDirection="column" w="35%">
        <Card p={6}>
          <CardBody p={0}>
            <VStack spacing={4}>
              <Heading size="lg" color={headingColor}>
                Add New Student
              </Heading>
              <VStack spacing={4} w="full">
                <Flex alignItems="center" w="full">
                  <FormLabel htmlFor="newStudentName" flex="25%" mb={0}>Name:</FormLabel>
                  <Input
                    flex="75%"
                    type="text"
                    name="name"
                    value={newStudent.name}
                    onChange={(e) =>
                      setNewStudent({ ...newStudent, name: e.target.value })
                    }
                  />
                </Flex>
                <Flex alignItems="center" w="full">
                  <FormLabel htmlFor="grade" flex="25%" mb={0}>Grade:</FormLabel>
                  <Input
                    flex="35%"
                    type="number"
                    name="grade"
                    value={newStudent.grade}
                    min={0}
                    max={100}
                    onChange={(e) =>
                      setNewStudent({ ...newStudent, grade: e.target.value })
                    }
                  />
                  <HStack spacing={4} ml={4}>
                    <HStack>
                      <FormLabel htmlFor="M" mb={0}>M</FormLabel>
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
                    </HStack>
                    <HStack>
                      <FormLabel htmlFor="F" mb={0}>F</FormLabel>
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
                    </HStack>
                  </HStack>
                </Flex>

                <HStack spacing={4} w="full" justify="center">
                  <HStack>
                    <FormLabel htmlFor="ESE" mb={0}>ESE</FormLabel>
                    <Checkbox
                      type="checkbox"
                      name="isESE"
                      isChecked={newStudent.isESE}
                      onChange={(e) =>
                        setNewStudent({
                          ...newStudent,
                          isESE: e.target.checked,
                        })
                      }
                    />
                  </HStack>
                  <HStack>
                    <FormLabel htmlFor="504" mb={0}>504</FormLabel>
                    <Checkbox
                      type="checkbox"
                      name="has504"
                      isChecked={newStudent.has504}
                      onChange={(e) =>
                        setNewStudent({
                          ...newStudent,
                          has504: e.target.checked,
                        })
                      }
                    />
                  </HStack>
                  <HStack>
                    <FormLabel htmlFor="ELL" mb={0}>ELL</FormLabel>
                    <Checkbox
                      type="checkbox"
                      name="isELL"
                      isChecked={newStudent.isELL}
                      onChange={(e) =>
                        setNewStudent({
                          ...newStudent,
                          isELL: e.target.checked,
                        })
                      }
                    />
                  </HStack>
                  <HStack>
                    <FormLabel htmlFor="EBD" mb={0}>EBD</FormLabel>
                    <Checkbox
                      type="checkbox"
                      name="isEBD"
                      isChecked={newStudent.isEBD}
                      onChange={(e) =>
                        setNewStudent({
                          ...newStudent,
                          isEBD: e.target.checked,
                        })
                      }
                    />
                  </HStack>
                </HStack>
                <Button
                  variant="solid"
                  onClick={createStudent}
                >
                  Add Student
                </Button>

                {formErrors.length ? <MakeAlert messages={formErrors} /> : null}
                {saveConfirmed.length ? (
                  <MakeAlert messages={saveConfirmed} />
                ) : null}
              </VStack>
            </VStack>
          </CardBody>
          <CardBody p={0} mt={6}>
            <VStack spacing={4}>
              <Heading size="lg" color={headingColor}>
                Update Student
              </Heading>
              <form style={{ width: "100%" }}>
                <VStack spacing={4} w="full">
                  <Flex alignItems="center" w="full">
                    <FormLabel htmlFor="name" flex="25%" mb={0}>Name:</FormLabel>
                    <Input
                      flex="75%"
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

                  <Flex alignItems="center" w="full">
                    <FormLabel htmlFor="grade" flex="25%" mb={0}>Grade:</FormLabel>
                    <Input
                      flex="35%"
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
                    <HStack spacing={4} ml={4}>
                      <HStack>
                        <FormLabel htmlFor="M" mb={0}>M</FormLabel>
                        <Radio
                          type="radio"
                          name="gender"
                          value="M"
                          isChecked={
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
                      </HStack>
                      <HStack>
                        <FormLabel htmlFor="F" mb={0}>F</FormLabel>
                        <Radio
                          type="radio"
                          name="gender"
                          value="F"
                          isChecked={
                            selectedStudent && selectedStudent.gender === "F"
                          }
                          onChange={() =>
                            setSelectedStudent(
                              selectedStudent
                                ? { ...selectedStudent, gender: "F" }
                                : null
                            )
                          }
                        />
                      </HStack>
                    </HStack>
                  </Flex>
                  <HStack spacing={4} w="full" justify="center">
                    <HStack>
                      <FormLabel htmlFor="ESE" mb={0}>ESE</FormLabel>
                      <Checkbox
                        type="checkbox"
                        name="isESE"
                        isChecked={
                          selectedStudent ? selectedStudent.isESE : false
                        }
                        onChange={() =>
                          setSelectedStudent({
                            ...selectedStudent,
                            isESE: !selectedStudent.isESE,
                          })
                        }
                      />
                    </HStack>
                    <HStack>
                      <FormLabel htmlFor="504" mb={0}>504</FormLabel>
                      <Checkbox
                        type="checkbox"
                        name="has504"
                        isChecked={
                          selectedStudent ? selectedStudent.has504 : false
                        }
                        onChange={() =>
                          setSelectedStudent({
                            ...selectedStudent,
                            has504: !selectedStudent.has504,
                          })
                        }
                      />
                    </HStack>
                    <HStack>
                      <FormLabel htmlFor="ELL" mb={0}>ELL</FormLabel>
                      <Checkbox
                        type="checkbox"
                        name="isELL"
                        isChecked={
                          selectedStudent ? selectedStudent.isELL : false
                        }
                        onChange={() =>
                          setSelectedStudent({
                            ...selectedStudent,
                            isELL: !selectedStudent.isELL,
                          })
                        }
                      />
                    </HStack>
                    <HStack>
                      <FormLabel htmlFor="EBD" mb={0}>EBD</FormLabel>
                      <Checkbox
                        type="checkbox"
                        name="isEBD"
                        isChecked={
                          selectedStudent ? selectedStudent.isEBD : false
                        }
                        onChange={() =>
                          setSelectedStudent({
                            ...selectedStudent,
                            isEBD: !selectedStudent.isEBD,
                          })
                        }
                      />
                    </HStack>
                  </HStack>
                  <HStack spacing={4}>
                    <Button
                      variant="solid"
                      type="button"
                      name="updateStudent"
                      onClick={(e) => updateStudent(e)}
                    >
                      Save Changes
                    </Button>

                    <Button
                      variant="outline"
                      type="button"
                      name="deleteStudent"
                      onClick={(e) => deleteStudent(e)}
                    >
                      Delete Student
                    </Button>
                  </HStack>

                  {formErrors.length ? <MakeAlert messages={formErrors} /> : null}
                  {saveConfirmed.length ? (
                    <MakeAlert messages={saveConfirmed} />
                  ) : null}
                </VStack>
              </form>
            </VStack>
          </CardBody>
        </Card>
      </Flex>
      <Card w="63%" p={6} id="studentContainer">
        <VStack spacing={4}>
          <Heading size="lg" color={headingColor}>
            Add Student Rosters
          </Heading>
          <Text color={textColor} textAlign="center">
            Use this page to enter students for this particular section. Add
            Students using the "Add Students" form, or by importing CSV
            files. Student info can be viewed and modified by clicking on
            their name and making changes in the "Edit Changes" form.
          </Text>
          <Flex direction="row" width="full" mt={4} justifyContent="flex-end" gap={4}>
            <Button variant="outline" onClick={() => handleCardClick()}>
              Expand Student List
            </Button>
            <Input
              w="240px"
              h="40px"
              type="file"
              onChange={handleCSVChange}
              accept=".csv"
              pt={1}
            />
            <VStack align="start">
              <Button variant="solid" onClick={handleCSVSubmit}>
                Submit CSV file
              </Button>
              {saveConfirmed && (
                <Text fontSize="sm" color="success.500">
                  Students added successfully!
                </Text>
              )}
            </VStack>
          </Flex>
        </VStack>
        <CardBody>
          {students && students.length === 0 ? (
            <EmptyState
              title="No students yet"
              description="Add students individually using the form, or upload a CSV file with your class roster."
              actionLabel="Add First Student"
              onAction={() => document.querySelector('input[name="name"]')?.focus()}
            />
          ) : (
            <Box overflowY="auto" maxHeight="280px">
              <SimpleGrid columns={5} spacing={2}>
                {students.map((student) => (
                  <React.Fragment key={student.studentId}>
                    <Flex py={4} position="relative">
                      <Box
                        maxW="510px"
                        w="full"
                        bg={cardBg}
                        borderWidth="1px"
                        borderColor={borderColor}
                        borderRadius="md"
                        p={4}
                        textAlign="center"
                      >
                        <Heading
                          size="sm"
                          color={headingColor}
                          style={{ cursor: "pointer" }}
                          onClick={() => setSelectedStudent(student)}
                        >
                          {student.name}
                        </Heading>
                        <Collapse in={allCardsExpanded}>
                          <VStack mt={2} spacing={2}>
                            <SimpleGrid columns={2} spacing={1} w="full">
                              <Text fontSize="sm" color={textColor}>Grade: {student.grade}</Text>
                              <Text fontSize="sm" color={textColor}>M/F: {student.gender}</Text>
                            </SimpleGrid>
                            <HStack spacing={1} wrap="wrap" justify="center">
                              <AccommodationBadge type="ESE" active={student.isESE} />
                              <AccommodationBadge type="504" active={student.has504} />
                              <AccommodationBadge type="ELL" active={student.isELL} />
                              <AccommodationBadge type="EBD" active={student.isEBD} />
                            </HStack>
                            <Button
                              onClick={() => setSelectedStudent(student)}
                              variant="outline"
                              size="sm"
                              w="full"
                            >
                              Edit Student
                            </Button>
                          </VStack>
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
  );
};

export default StudentForm;
