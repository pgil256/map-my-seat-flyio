import { useState, useContext, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import useApi from "../hooks/useApi";
import LoadingSpinner from "../common/LoadingSpinner";
import UserContext from "../auth/UserContext";
import MakeAlert from "../common/MakeAlert";
import EmptyState from "../common/EmptyState";
import StudentConstraints from "./StudentConstraints";
import useKeyboardShortcuts from "../hooks/useKeyboardShortcuts";
import Papa from "papaparse";


import {
  Box,
  Heading,
  Stack,
  SimpleGrid,
  Text,
  Button,
  FormLabel,
  Card,
  CardBody,
  Input,
  RadioGroup,
  Radio,
  Checkbox,
  Container,
  HStack,
  VStack,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
} from "@chakra-ui/react";

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
  const [allCardsExpanded, setAllCardsExpanded] = useState(false); // Now a boolean

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
          setFormErrors([error.message || "Failed to load students"]);
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
          // setIsEditMode(false);
          return newStudents;
        }
        return prevStudents;
      });
      setFormErrors([]);
      setSaveConfirmed(true);
    } catch (err) {
      setFormErrors([err.message || "Failed to update student"]);
    }
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
      setFormErrors([]);
      setSaveConfirmed(true);
    } catch (err) {
      setFormErrors([err.message || "Failed to create student"]);
    }
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
        return setFormErrors([...formErrors, err.message || "Failed to import student"]);
      }
    }
    setSaveConfirmed(true);
  };

  const handleCardClick = () => {
    setAllCardsExpanded(!allCardsExpanded); // toggle the boolean value
  };

  const accommodationLabels = (student) => [
    student.isESE ? "ESE" : null,
    student.has504 ? "504" : null,
    student.isELL ? "ELL" : null,
    student.isEBD ? "EBD" : null,
  ].filter(Boolean);

  if (infoLoading) {
    return <LoadingSpinner />;
  }

  return (
    <Container maxW="7xl" py={{ base: 6, md: 8 }}>
      <Stack spacing={6}>
        <Box>
          <Heading size="xl">Add Student Rosters</Heading>
          <Text color="brand.600" mt={2} maxW="3xl">
            Build the class roster, flag accommodations, and define seating
            rules before generating a chart.
          </Text>
        </Box>

        <SimpleGrid columns={{ base: 1, xl: 3 }} spacing={5} alignItems="start">
          <VStack spacing={5} align="stretch">
            <Card>
              <CardBody>
                <VStack spacing={4} align="stretch">
                  <Heading size="md">Add New Student</Heading>
                  <Box>
                    <FormLabel htmlFor="newStudentName">Name</FormLabel>
                    <Input
                      type="text"
                      id="newStudentName"
                      name="name"
                      value={newStudent.name || ""}
                      onChange={(e) =>
                        setNewStudent({ ...newStudent, name: e.target.value })
                      }
                    />
                  </Box>
                  <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={3}>
                    <Box>
                      <FormLabel htmlFor="newStudentGrade">Grade</FormLabel>
                      <Input
                        id="newStudentGrade"
                        type="number"
                        name="grade"
                        value={newStudent.grade || ""}
                        min={0}
                        max={100}
                        onChange={(e) =>
                          setNewStudent({ ...newStudent, grade: e.target.value })
                        }
                      />
                    </Box>
                    <Box>
                      <FormLabel>Gender</FormLabel>
                      <RadioGroup value={newStudent.gender || ""}>
                        <HStack spacing={4}>
                          <Radio
                            name="gender"
                            value="M"
                            onChange={(e) =>
                              setNewStudent({ ...newStudent, gender: e.target.value })
                            }
                          >
                            Male
                          </Radio>
                          <Radio
                            name="gender"
                            value="F"
                            onChange={(e) =>
                              setNewStudent({ ...newStudent, gender: e.target.value })
                            }
                          >
                            Female
                          </Radio>
                        </HStack>
                      </RadioGroup>
                    </Box>
                  </SimpleGrid>
                  <Box>
                    <FormLabel>Accommodation flags</FormLabel>
                    <HStack spacing={4} flexWrap="wrap">
                      <Checkbox
                        name="isESE"
                        isChecked={!!newStudent.isESE}
                        onChange={(e) =>
                          setNewStudent({ ...newStudent, isESE: e.target.checked })
                        }
                      >
                        ESE
                      </Checkbox>
                      <Checkbox
                        name="has504"
                        isChecked={!!newStudent.has504}
                        onChange={(e) =>
                          setNewStudent({ ...newStudent, has504: e.target.checked })
                        }
                      >
                        504
                      </Checkbox>
                      <Checkbox
                        name="isELL"
                        isChecked={!!newStudent.isELL}
                        onChange={(e) =>
                          setNewStudent({ ...newStudent, isELL: e.target.checked })
                        }
                      >
                        ELL
                      </Checkbox>
                      <Checkbox
                        name="isEBD"
                        isChecked={!!newStudent.isEBD}
                        onChange={(e) =>
                          setNewStudent({ ...newStudent, isEBD: e.target.checked })
                        }
                      >
                        EBD
                      </Checkbox>
                    </HStack>
                  </Box>
                  <Button onClick={createStudent}>Add Student</Button>
                </VStack>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <form>
                  <VStack spacing={4} align="stretch">
                    <Box>
                      <Heading size="md">Update Student</Heading>
                      <Text color="brand.500" fontSize="sm" mt={1}>
                        Select a student from the roster table.
                      </Text>
                    </Box>
                    <Box>
                      <FormLabel htmlFor="selectedStudentName">Name</FormLabel>
                      <Input
                        id="selectedStudentName"
                        type="text"
                        name="name"
                        value={selectedStudent.name || ""}
                        onChange={(e) =>
                          setSelectedStudent({
                            ...selectedStudent,
                            name: e.target.value,
                          })
                        }
                      />
                    </Box>
                    <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={3}>
                      <Box>
                        <FormLabel htmlFor="selectedStudentGrade">Grade</FormLabel>
                        <Input
                          id="selectedStudentGrade"
                          type="number"
                          name="grade"
                          value={selectedStudent.grade || ""}
                          min={0}
                          max={100}
                          onChange={(e) =>
                            setSelectedStudent({
                              ...selectedStudent,
                              grade: parseInt(e.target.value),
                            })
                          }
                        />
                      </Box>
                      <Box>
                        <FormLabel>Gender</FormLabel>
                        <RadioGroup value={selectedStudent.gender || ""}>
                          <HStack spacing={4}>
                            <Radio
                              name="selectedGender"
                              value="M"
                              onChange={() =>
                                setSelectedStudent({ ...selectedStudent, gender: "M" })
                              }
                            >
                              Male
                            </Radio>
                            <Radio
                              name="selectedGender"
                              value="F"
                              onChange={() =>
                                setSelectedStudent({ ...selectedStudent, gender: "F" })
                              }
                            >
                              Female
                            </Radio>
                          </HStack>
                        </RadioGroup>
                      </Box>
                    </SimpleGrid>
                    <Box>
                      <FormLabel>Accommodation flags</FormLabel>
                      <HStack spacing={4} flexWrap="wrap">
                        {[
                          ["isESE", "ESE"],
                          ["has504", "504"],
                          ["isELL", "ELL"],
                          ["isEBD", "EBD"],
                        ].map(([field, label]) => (
                          <Checkbox
                            key={field}
                            name={field}
                            isChecked={!!selectedStudent[field]}
                            onChange={() =>
                              setSelectedStudent({
                                ...selectedStudent,
                                [field]: !selectedStudent[field],
                              })
                            }
                          >
                            {label}
                          </Checkbox>
                        ))}
                      </HStack>
                    </Box>
                    <HStack>
                      <Button
                        type="button"
                        name="updateStudent"
                        onClick={(e) => updateStudent(e)}
                        isDisabled={!selectedStudent.studentId}
                      >
                        Save Changes
                      </Button>
                      <Button
                        variant="danger"
                        type="button"
                        name="deleteStudent"
                        onClick={(e) => deleteStudent(e)}
                        isDisabled={!selectedStudent.studentId}
                      >
                        Delete Student
                      </Button>
                    </HStack>
                    {formErrors.length ? <MakeAlert messages={formErrors} /> : null}
                    {saveConfirmed ? (
                      <MakeAlert messages={["Changes saved successfully"]} />
                    ) : null}
                  </VStack>
                </form>
              </CardBody>
            </Card>
          </VStack>

          <Stack spacing={5} gridColumn={{ base: "auto", xl: "span 2" }}>
            <Card id="studentContainer">
              <CardBody>
                <FlexHeader
                  count={students.length}
                  expanded={allCardsExpanded}
                  onToggle={handleCardClick}
                  onFileChange={handleCSVChange}
                  onCsvSubmit={handleCSVSubmit}
                />

                {students && students.length === 0 ? (
                  <EmptyState
                    title="No students yet"
                    description="Add students individually using the form, or upload a CSV file with your class roster."
                    actionLabel="Add First Student"
                    onAction={() => document.querySelector('input[name="name"]')?.focus()}
                  />
                ) : (
                  <Box overflowX="auto">
                    <Table variant="simple" size="sm">
                      <Thead>
                        <Tr>
                          <Th>Name</Th>
                          <Th>Grade</Th>
                          <Th>Gender</Th>
                          <Th>Flags</Th>
                          {allCardsExpanded && <Th>Student ID</Th>}
                        </Tr>
                      </Thead>
                      <Tbody>
                        {students.map((student) => (
                          <Tr
                            key={student.studentId}
                            cursor="pointer"
                            bg={selectedStudent?.studentId === student.studentId ? "accent.50" : undefined}
                            _dark={{
                              bg: selectedStudent?.studentId === student.studentId ? "brand.700" : undefined,
                            }}
                            onClick={() => setSelectedStudent(student)}
                          >
                            <Td fontWeight="medium">{student.name}</Td>
                            <Td>{student.grade}</Td>
                            <Td>{student.gender}</Td>
                            <Td>
                              <HStack spacing={1} flexWrap="wrap">
                                {accommodationLabels(student).length ? (
                                  accommodationLabels(student).map((label) => (
                                    <Badge key={label} colorScheme="accent">
                                      {label}
                                    </Badge>
                                  ))
                                ) : (
                                  <Text color="brand.400" fontSize="sm">None</Text>
                                )}
                              </HStack>
                            </Td>
                            {allCardsExpanded && <Td>{student.studentId}</Td>}
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </Box>
                )}
              </CardBody>
            </Card>

            <StudentConstraints periodId={periodId} students={students} />
          </Stack>
        </SimpleGrid>
      </Stack>
    </Container>
  );
};

function FlexHeader({ count, expanded, onToggle, onFileChange, onCsvSubmit }) {
  return (
    <Stack spacing={4} mb={5}>
      <HStack justify="space-between" align="start" flexWrap="wrap" gap={3}>
        <Box>
          <Heading size="md">Roster</Heading>
          <Text color="brand.500" fontSize="sm">
            {count} student{count === 1 ? "" : "s"} in this period
          </Text>
        </Box>
        <Button size="sm" variant="outline" onClick={onToggle}>
          {expanded ? "Collapse Student List" : "Expand Student List"}
        </Button>
      </HStack>
      <HStack spacing={3} flexWrap="wrap">
        <Input
          maxW="260px"
          type="file"
          onChange={onFileChange}
          accept=".csv"
        />
        <Button variant="outline" onClick={onCsvSubmit}>
          Submit CSV file
        </Button>
      </HStack>
    </Stack>
  );
}

export default StudentForm;
