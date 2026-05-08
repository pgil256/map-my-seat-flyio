import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useApi from "../hooks/useApi";
import UserContext from "../auth/UserContext";
import MakeAlert from "../common/MakeAlert";
import EmptyState from "../common/EmptyState";
import {
  Stack,
  Box,
  Heading,
  Container,
  Card,
  SimpleGrid,
  CardBody,
  Button,
  FormLabel,
  Input,
  Text,
  Flex,
  HStack,
  VStack,
} from "@chakra-ui/react";

//Gets all periods on mount, returns message if there are none yet
//Creates a list of current periods if they exist, allows user to edit and save edits on click
//Allows user to add new periods and add to aforementioned list
const PeriodForm = () => {
  const { currentUser } = useContext(UserContext);
  const { api } = useApi();
  const username = currentUser.username;
  const navigate = useNavigate();

  const [periods, setPeriods] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState({
    schoolYear: "",
    title: "",
    number: "",
  });
  const [formData, setFormData] = useState({
    schoolYear: "",
    title: "",
    number: "",
  });
  const [formErrors, setFormErrors] = useState([]);
  const [saveConfirmed, setSaveConfirmed] = useState(false);

  useEffect(() => {
    async function getPeriodsOnMount() {
      try {
        let periods = await api.getPeriods(username);
        setPeriods(periods);
      } catch (err) {
        setFormErrors([err.message || "Periods could not be retrieved"]);
      }
    }
    getPeriodsOnMount();
  }, [username, api]);

  const updatePeriod = async (e, period) => {
    e.preventDefault();
    let periodId = period.periodId;
    const data = {
      periodId: periodId,
      schoolYear: period.schoolYear,
      title: period.title,
      number: period.number,
    };

    try {
      const updatedPeriod = await api.updatePeriod(
        username,
        periodId,
        data
      );
      await new Promise((resolve) => setTimeout(resolve, 0));

      setPeriods((prevPeriods) => {
        const newPeriods = [...prevPeriods];
        const index = newPeriods.findIndex(
          (period) => period.number === updatedPeriod.number
        );
        newPeriods[index] = updatedPeriod;
        return newPeriods;
      });
      setFormErrors([]);
      setSaveConfirmed(true);
    } catch (err) {
      setFormErrors([err.message || "Failed to update period"]);
    }
  };

  const deletePeriod = async (e, period) => {
    e.preventDefault();
    try {
      await api.deletePeriod(username, period.periodId);
      await new Promise((resolve) => setTimeout(resolve, 0));

      setPeriods((p) => p.filter((p) => p.periodId !== period.periodId));
      setFormErrors([]);
      setSaveConfirmed(true);
    } catch (err) {
      setFormErrors([err.message || "Failed to delete period"]);
    }
  };

  const createPeriod = async (e) => {
    e.preventDefault();
    const { schoolYear, title, number } = formData;
    let data = {
      username: username,
      schoolYear: schoolYear,
      title: title,
      number: parseInt(number),
    };
    if (data.number <= 0) {
      return setFormErrors(["Period number must be greater than zero"]);
    }
    try {
      const addedPeriod = await api.createPeriod(username, data);
      await new Promise((resolve) => setTimeout(resolve, 0));
      if (addedPeriod) {
        try {
          let fetchedPeriods = await api.getPeriods(username);
          setPeriods(fetchedPeriods);
        } catch (err) {
          setFormErrors([err.message || "Periods could not be retrieved"]);
        }
      }
      setFormData({ schoolYear: "", title: "", number: "" });
      setFormErrors([]);
      setSaveConfirmed(true);
    } catch (err) {
      setFormErrors([err.message || "Failed to create period"]);
    }
  };

  const handleEdit = (index) => {
    setSelectedPeriod(periods[index]);
  };

  return (
    <Container maxW="7xl" py={{ base: 6, md: 8 }}>
      <Flex
        direction={{ base: "column", md: "row" }}
        justify="space-between"
        align={{ base: "start", md: "end" }}
        gap={4}
        mb={6}
      >
        <Box>
          <Heading size="xl">Enter Class Periods</Heading>
          <Text color="brand.600" mt={2} maxW="3xl">
            Create each course section, then open a roster to add students and
            seating rules.
          </Text>
        </Box>
        <Text color="brand.500" fontSize="sm">
          {periods.length} period{periods.length === 1 ? "" : "s"}
        </Text>
      </Flex>

      <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={5} alignItems="start">
        <VStack spacing={5} align="stretch">
          <Card id="forms">
            <CardBody>
              <form id="newPeriodForm" onSubmit={createPeriod}>
                <VStack spacing={4} align="stretch">
                  <Heading as="h3" size="md">New Period</Heading>
                  <Box>
                    <FormLabel htmlFor="schoolYearInput">School year</FormLabel>
                    <Input
                      type="text"
                      id="schoolYearInput"
                      placeholder="2025-2026"
                      value={formData.schoolYear}
                      onChange={(e) =>
                        setFormData((f) => ({ ...f, schoolYear: e.target.value }))
                      }
                    />
                  </Box>
                  <Box>
                    <FormLabel htmlFor="titleInput">Class title</FormLabel>
                    <Input
                      type="text"
                      id="titleInput"
                      placeholder="Algebra 1 Honors"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData((f) => ({ ...f, title: e.target.value }))
                      }
                    />
                  </Box>
                  <Box>
                    <FormLabel htmlFor="numberInput">Period number</FormLabel>
                    <Input
                      type="number"
                      id="numberInput"
                      placeholder="5"
                      value={formData.number}
                      onChange={(e) =>
                        setFormData((f) => ({ ...f, number: e.target.value }))
                      }
                    />
                  </Box>
                  <Button type="submit">Create Period</Button>
                </VStack>
              </form>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <form id="selectedPeriodForm">
                <VStack spacing={4} align="stretch">
                  <Box>
                    <Heading as="h3" size="md">Edit Period</Heading>
                    <Text color="brand.500" fontSize="sm" mt={1}>
                      Select a period from the list before editing.
                    </Text>
                  </Box>
                  <Box>
                    <FormLabel htmlFor="selectedSchoolYearInput">School year</FormLabel>
                    <Input
                      type="text"
                      id="selectedSchoolYearInput"
                      value={selectedPeriod.schoolYear || ""}
                      onChange={(e) =>
                        setSelectedPeriod((p) => ({
                          ...p,
                          schoolYear: e.target.value,
                        }))
                      }
                    />
                  </Box>
                  <Box>
                    <FormLabel htmlFor="selectedTitleInput">Class title</FormLabel>
                    <Input
                      type="text"
                      id="selectedTitleInput"
                      value={selectedPeriod.title || ""}
                      onChange={(e) =>
                        setSelectedPeriod((p) => ({ ...p, title: e.target.value }))
                      }
                    />
                  </Box>
                  <Box>
                    <FormLabel htmlFor="selectedNumberInput">Period number</FormLabel>
                    <Input
                      type="number"
                      id="selectedNumberInput"
                      value={selectedPeriod.number || ""}
                      onChange={(e) =>
                        setSelectedPeriod((p) => ({ ...p, number: e.target.value }))
                      }
                    />
                  </Box>
                  <HStack>
                    <Button
                      id="saveButton"
                      onClick={(e) => updatePeriod(e, selectedPeriod)}
                      isDisabled={!selectedPeriod.periodId}
                    >
                      Save
                    </Button>
                    <Button
                      variant="danger"
                      id="deleteButton"
                      onClick={(e) => deletePeriod(e, selectedPeriod)}
                      isDisabled={!selectedPeriod.periodId}
                    >
                      Delete
                    </Button>
                  </HStack>
                  {formErrors.length ? <MakeAlert messages={formErrors} /> : null}
                  {saveConfirmed ? (
                    <MakeAlert messages={["Changes saved successfully."]} />
                  ) : null}
                </VStack>
              </form>
            </CardBody>
          </Card>
        </VStack>

        <Card id="periodContainer" gridColumn={{ base: "auto", lg: "span 2" }}>
          <CardBody>
            {periods && periods.length === 0 ? (
              <EmptyState
                title="No periods yet"
                description="Create your first class period to start adding students and generating seating charts."
                actionLabel="Create Period"
                onAction={() => document.getElementById("titleInput")?.focus()}
              />
            ) : (
              <Stack spacing={3}>
                {periods.map((period, index) => (
                  <Flex
                    key={period.periodId}
                    align={{ base: "start", md: "center" }}
                    justify="space-between"
                    gap={4}
                    direction={{ base: "column", md: "row" }}
                    p={4}
                    borderWidth="1px"
                    borderColor="brand.200"
                    borderRadius="md"
                    bg="white"
                    _dark={{ bg: "brand.800", borderColor: "brand.700" }}
                  >
                    <Box>
                      <Heading size="md">Period {period.number}</Heading>
                      <HStack spacing={3} mt={1} color="brand.500" fontSize="sm">
                        <Text fontWeight="medium">{period.title}</Text>
                        <Text>{period.schoolYear}</Text>
                      </HStack>
                    </Box>
                    <Stack direction={{ base: "column", sm: "row" }} spacing={2} w={{ base: "full", md: "auto" }}>
                      <Button
                        onClick={() => handleEdit(index)}
                        variant="outline"
                        size="sm"
                      >
                        Edit Period
                      </Button>
                      <Button
                        onClick={() => navigate(`/periods/${period.periodId}`)}
                        size="sm"
                      >
                        Add Students
                      </Button>
                    </Stack>
                  </Flex>
                ))}
              </Stack>
            )}
          </CardBody>
        </Card>
      </SimpleGrid>
    </Container>
  );
};

export default PeriodForm;
