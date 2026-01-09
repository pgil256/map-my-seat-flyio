import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import useApi from "../hooks/useApi";
import UserContext from "../auth/UserContext";
import EmptyState from "../common/EmptyState";
import LoadingSpinner from "../common/LoadingSpinner";
import {
  Box,
  Button,
  Card,
  CardBody,
  Container,
  Heading,
  SimpleGrid,
  Text,
  Input,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  VStack,
  HStack,
  IconButton,
} from "@chakra-ui/react";
import { AddIcon, DeleteIcon } from "@chakra-ui/icons";

function ClassroomList() {
  const { currentUser } = useContext(UserContext);
  const { api } = useApi();
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const getDeskCount = (seatingConfig) => {
    if (!seatingConfig) return 0;
    try {
      const config = JSON.parse(seatingConfig);
      if (!Array.isArray(config)) return 0;
      return config.flat().filter(c => c === "desk").length;
    } catch {
      return 0;
    }
  };

  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newClassroomName, setNewClassroomName] = useState("");

  useEffect(() => {
    async function fetchClassrooms() {
      try {
        const data = await api.getClassrooms(currentUser.username);
        setClassrooms(data);
      } catch (err) {
        console.error("Failed to fetch classrooms:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchClassrooms();
  }, [currentUser.username, api]);

  const handleCreateClassroom = async () => {
    try {
      const classroom = await api.createClassroomWithName(
        currentUser.username,
        newClassroomName || "My Classroom"
      );
      setClassrooms([...classrooms, classroom]);
      setNewClassroomName("");
      onClose();
    } catch (err) {
      console.error("Failed to create classroom:", err);
    }
  };

  const handleDeleteClassroom = async (classroomId) => {
    if (!window.confirm("Delete this classroom and all its seating charts?")) {
      return;
    }
    try {
      await api.deleteClassroom(currentUser.username, classroomId);
      setClassrooms(classrooms.filter(c => c.classroomId !== classroomId));
    } catch (err) {
      console.error("Failed to delete classroom:", err);
    }
  };

  if (loading) return <LoadingSpinner message="Loading classrooms..." />;

  return (
    <Container maxW="6xl" py={8}>
      <HStack justify="space-between" mb={6}>
        <Heading size="lg">My Classrooms</Heading>
        <Button leftIcon={<AddIcon />} colorScheme="blue" onClick={onOpen}>
          New Classroom
        </Button>
      </HStack>

      {classrooms.length === 0 ? (
        <EmptyState
          title="No classrooms yet"
          description="Create your first classroom to start designing seating layouts."
          actionLabel="Create Classroom"
          onAction={onOpen}
        />
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          {classrooms.map((classroom) => (
            <Card key={classroom.classroomId} variant="outline">
              <CardBody>
                <VStack align="start" spacing={3}>
                  <Heading size="md">{classroom.name}</Heading>
                  <Text color="gray.500" fontSize="sm">
                    {getDeskCount(classroom.seatingConfig) > 0
                      ? `${getDeskCount(classroom.seatingConfig)} desks`
                      : "No layout configured"}
                  </Text>
                  <HStack spacing={2} w="full">
                    <Button
                      flex={1}
                      colorScheme="blue"
                      onClick={() => navigate(`/classrooms/${currentUser.username}/${classroom.classroomId}`)}
                    >
                      Edit Layout
                    </Button>
                    <IconButton
                      icon={<DeleteIcon />}
                      colorScheme="red"
                      variant="outline"
                      onClick={() => handleDeleteClassroom(classroom.classroomId)}
                      aria-label="Delete classroom"
                    />
                  </HStack>
                </VStack>
              </CardBody>
            </Card>
          ))}
        </SimpleGrid>
      )}

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create New Classroom</ModalHeader>
          <ModalBody>
            <Input
              placeholder="Classroom name (e.g., Room 101)"
              value={newClassroomName}
              onChange={(e) => setNewClassroomName(e.target.value)}
            />
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="blue" onClick={handleCreateClassroom}>
              Create
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  );
}

export default ClassroomList;
