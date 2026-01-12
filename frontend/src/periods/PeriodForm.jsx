import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useApi from "../hooks/useApi";
import UserContext from "../auth/UserContext";
import MakeAlert from "../common/MakeAlert";
import EmptyState from "../common/EmptyState";
import {
  VStack,
  Box,
  Heading,
  Container,
  Card,
  SimpleGrid,
  Center,
  CardBody,
  Button,
  FormLabel,
  Input,
  Text,
  Flex,
  HStack,
  useColorModeValue,
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

  const headingColor = useColorModeValue("brand.800", "brand.100");
  const textColor = useColorModeValue("brand.600", "brand.300");
  const cardBg = useColorModeValue("white", "brand.800");
  const borderColor = useColorModeValue("brand.200", "brand.700");

  useEffect(() => {
    async function getPeriodsOnMount() {
      try {
        let periods = await api.getPeriods(username);
        setPeriods(periods);
      } catch (err) {
        console.error("Periods could not be retrieved", err.message);
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
      setFormErrors(err);
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
      setFormErrors(err);
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
      return setFormErrors("Period number must be greater than one");
    }
    try {
      const addedPeriod = await api.createPeriod(username, data);
      await new Promise((resolve) => setTimeout(resolve, 0));
      if (addedPeriod) {
        try {
          let fetchedPeriods = await api.getPeriods(username);
          setPeriods(fetchedPeriods);
        } catch (err) {
          console.error("Periods could not be retrieved", err.message);
        }
      }
      setFormData({ schoolYear: "", title: "", number: "" });
      setFormErrors([]);
      setSaveConfirmed(true);
    } catch (err) {
      setFormErrors(err);
    }
  };

  const handleEdit = (index) => {
    setSelectedPeriod(periods[index]);
  };

  return (
    <Flex direction="row" justifyContent="space-between" w="100vw" gap={4} p={2}>
      <Card w="29%" p={6}>
        <CardBody p={0}>
          <form id="newPeriodForm" onSubmit={createPeriod}>
            <VStack spacing={4}>
              <Heading size="md" color={headingColor}>
                New Period
              </Heading>

              <Flex w="full" alignItems="center">
                <FormLabel htmlFor="schoolYear" flex="30%" mb={0}>
                  School Year:
                </FormLabel>
                <Input
                  flex="70%"
                  type="text"
                  id="schoolYearInput"
                  placeholder="2024"
                  value={formData.schoolYear}
                  onChange={(e) =>
                    setFormData((f) => ({ ...f, schoolYear: e.target.value }))
                  }
                />
              </Flex>

              <Flex w="full" alignItems="center">
                <FormLabel htmlFor="title" flex="30%" mb={0}>
                  Class title:
                </FormLabel>
                <Input
                  flex="70%"
                  type="text"
                  id="titleInput"
                  placeholder="Algebra 1 Honors"
                  defaultValue={formData.title}
                  onChange={(e) =>
                    setFormData((f) => ({ ...f, title: e.target.value }))
                  }
                />
              </Flex>

              <Flex w="full" alignItems="center">
                <FormLabel htmlFor="number" flex="30%" mb={0}>
                  Period number:
                </FormLabel>
                <Input
                  flex="70%"
                  type="number"
                  id="numberInput"
                  placeholder="5"
                  defaultValue={formData.number}
                  onChange={(e) =>
                    setFormData((f) => ({ ...f, number: e.target.value }))
                  }
                />
              </Flex>

              <Button variant="solid" onClick={createPeriod}>
                Create Period
              </Button>
            </VStack>
          </form>
        </CardBody>

        <CardBody p={0} mt={6} key={selectedPeriod.id}>
          <form id="selectedPeriodForm">
            <VStack spacing={4}>
              <Heading size="md" color={headingColor}>
                Edit Period
              </Heading>

              <Flex w="full" alignItems="center">
                <FormLabel htmlFor="schoolYear" flex="30%" mb={0}>
                  School Year:
                </FormLabel>
                <Input
                  flex="70%"
                  type="text"
                  id="schoolYearInput"
                  value={selectedPeriod.schoolYear || ""}
                  onChange={(e) =>
                    setSelectedPeriod((p) => ({
                      ...p,
                      schoolYear: e.target.value,
                    }))
                  }
                />
              </Flex>

              <Flex w="full" alignItems="center">
                <FormLabel htmlFor="title" flex="30%" mb={0}>
                  Class title:
                </FormLabel>
                <Input
                  flex="70%"
                  type="text"
                  id="titleInput"
                  value={selectedPeriod.title || ""}
                  onChange={(e) =>
                    setSelectedPeriod((p) => ({ ...p, title: e.target.value }))
                  }
                />
              </Flex>

              <Flex w="full" alignItems="center">
                <FormLabel htmlFor="number" flex="30%" mb={0}>
                  Period number:
                </FormLabel>
                <Input
                  flex="70%"
                  type="number"
                  id="numberInput"
                  value={selectedPeriod.number || ""}
                  onChange={(e) =>
                    setSelectedPeriod((p) => ({ ...p, number: e.target.value }))
                  }
                />
              </Flex>

              <HStack spacing={4}>
                <Button
                  variant="solid"
                  id="saveButton"
                  onClick={(e) => updatePeriod(e, selectedPeriod)}
                >
                  Save
                </Button>
                <Button
                  variant="outline"
                  id="deleteButton"
                  onClick={(e) => deletePeriod(e, selectedPeriod)}
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

      <Card w="69%" p={6} id="periodContainer">
        <VStack spacing={4}>
          <Heading size="lg" color={headingColor}>
            Enter Class Periods
          </Heading>
          <Container maxW="4xl" centerContent>
            <Text color={textColor} textAlign="center">
              Use this page to enter each of your course sections. Once
              finished, hit the 'Add Students' Button to add student
              rosters. Each period will populate below and can be modified
              by hitting the 'Edit Period' button.
            </Text>
          </Container>
        </VStack>
        <CardBody>
          {periods && periods.length === 0 ? (
            <EmptyState
              title="No periods yet"
              description="Create your first class period to start adding students and generating seating charts."
              actionLabel="Create Period"
              onAction={() => document.getElementById("titleInput")?.focus()}
            />
          ) : (
            <SimpleGrid columns={3} spacing={4}>
              {periods.map((period, index) => (
                <Box py={4} key={period.periodId}>
                  <Box
                    maxW="280px"
                    w="full"
                    bg={cardBg}
                    borderWidth="1px"
                    borderColor={borderColor}
                    borderRadius="md"
                    p={4}
                    textAlign="center"
                  >
                    <Heading size="md" color={headingColor}>
                      Period {period.number}
                    </Heading>
                    <Center>
                      <HStack spacing={2} mt={2}>
                        <Text fontWeight="medium" color={textColor}>
                          {period.title}
                        </Text>
                        <Text fontWeight="medium" color={textColor}>
                          {period.schoolYear}
                        </Text>
                      </HStack>
                    </Center>

                    <HStack mt={4} spacing={2}>
                      <Button
                        onClick={() => handleEdit(index)}
                        flex={1}
                        variant="outline"
                        size="sm"
                      >
                        Edit Period
                      </Button>
                      <Button
                        onClick={() =>
                          navigate(`/periods/${period.periodId}`)
                        }
                        flex={1}
                        variant="solid"
                        size="sm"
                      >
                        Add Students
                      </Button>
                    </HStack>
                  </Box>
                </Box>
              ))}
            </SimpleGrid>
          )}
        </CardBody>
      </Card>
    </Flex>
  );
};

export default PeriodForm;
