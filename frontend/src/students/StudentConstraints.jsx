import { useState, useEffect, useContext } from "react";
import useApi from "../hooks/useApi";
import UserContext from "../auth/UserContext";
import {
  Box,
  Button,
  Card,
  CardBody,
  Heading,
  Select,
  HStack,
  VStack,
  Text,
  Badge,
  IconButton,
  useToast,
} from "@chakra-ui/react";
import { DeleteIcon } from "@chakra-ui/icons";

function StudentConstraints({ periodId, students }) {
  const { currentUser } = useContext(UserContext);
  const { api } = useApi();
  const toast = useToast();

  const [constraints, setConstraints] = useState([]);
  const [studentId1, setStudentId1] = useState("");
  const [studentId2, setStudentId2] = useState("");
  const [constraintType, setConstraintType] = useState("separate");

  useEffect(() => {
    async function fetchConstraints() {
      try {
        const data = await api.getConstraints(currentUser.username, periodId);
        setConstraints(data);
      } catch (err) {
        console.error("Failed to fetch constraints:", err);
      }
    }
    if (periodId) fetchConstraints();
  }, [currentUser.username, periodId]);

  const handleAddConstraint = async () => {
    if (!studentId1 || !studentId2) {
      toast({ title: "Select two students", status: "warning" });
      return;
    }
    if (studentId1 === studentId2) {
      toast({ title: "Select different students", status: "warning" });
      return;
    }

    try {
      const constraint = await api.createConstraint(
        currentUser.username,
        periodId,
        {
          studentId1: parseInt(studentId1),
          studentId2: parseInt(studentId2),
          constraintType
        }
      );

      // Enrich with student names for display
      const s1 = students.find(s => s.studentId === parseInt(studentId1));
      const s2 = students.find(s => s.studentId === parseInt(studentId2));
      constraint.studentName1 = s1?.name;
      constraint.studentName2 = s2?.name;

      setConstraints([...constraints, constraint]);
      setStudentId1("");
      setStudentId2("");
      toast({ title: "Constraint added", status: "success" });
    } catch (err) {
      toast({ title: "Failed to add constraint", status: "error" });
    }
  };

  const handleDeleteConstraint = async (constraintId) => {
    try {
      await api.deleteConstraint(currentUser.username, periodId, constraintId);
      setConstraints(constraints.filter(c => c.constraintId !== constraintId));
      toast({ title: "Constraint removed", status: "success" });
    } catch (err) {
      toast({ title: "Failed to remove constraint", status: "error" });
    }
  };

  return (
    <Card>
      <CardBody>
        <Heading size="md" mb={4}>Student Seating Rules</Heading>

        <VStack spacing={4} align="stretch">
          <HStack spacing={2}>
            <Select
              placeholder="Student 1"
              value={studentId1}
              onChange={(e) => setStudentId1(e.target.value)}
            >
              {students.map(s => (
                <option key={s.studentId} value={s.studentId}>{s.name}</option>
              ))}
            </Select>

            <Select
              value={constraintType}
              onChange={(e) => setConstraintType(e.target.value)}
              w="150px"
            >
              <option value="separate">Keep Apart</option>
              <option value="pair">Seat Together</option>
            </Select>

            <Select
              placeholder="Student 2"
              value={studentId2}
              onChange={(e) => setStudentId2(e.target.value)}
            >
              {students.map(s => (
                <option key={s.studentId} value={s.studentId}>{s.name}</option>
              ))}
            </Select>

            <Button colorScheme="blue" onClick={handleAddConstraint}>
              Add
            </Button>
          </HStack>

          {constraints.length > 0 && (
            <Box>
              <Text fontWeight="semibold" mb={2}>Active Rules:</Text>
              <VStack spacing={2} align="stretch">
                {constraints.map(c => (
                  <HStack
                    key={c.constraintId}
                    p={2}
                    bg="gray.50"
                    borderRadius="md"
                    justify="space-between"
                  >
                    <HStack>
                      <Text>{c.studentName1}</Text>
                      <Badge colorScheme={c.constraintType === 'separate' ? 'red' : 'green'}>
                        {c.constraintType === 'separate' ? 'apart from' : 'with'}
                      </Badge>
                      <Text>{c.studentName2}</Text>
                    </HStack>
                    <IconButton
                      icon={<DeleteIcon />}
                      size="sm"
                      variant="ghost"
                      colorScheme="red"
                      onClick={() => handleDeleteConstraint(c.constraintId)}
                      aria-label="Remove constraint"
                    />
                  </HStack>
                ))}
              </VStack>
            </Box>
          )}
        </VStack>
      </CardBody>
    </Card>
  );
}

export default StudentConstraints;
