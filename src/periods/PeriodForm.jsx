import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SeatingApi from "../api.js";
import UserContext from "../auth/UserContext";
import Alert from "../common/Alert";
import {
  Stack,
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
  Spacer,
} from "@chakra-ui/react";

//Gets all periods on mount, returns message if there are none yet
//Creates a list of current periods if they exist, allows user to edit and save edits on click
//Allows user to add new periods and add to aforementioned list
const PeriodForm = () => {
  const { currentUser } = useContext(UserContext);
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
        let periods = await SeatingApi.getPeriods(username);
        setPeriods(periods);
      } catch (err) {
        console.error("Periods could not be retrieved", err.message);
      }
    }
    getPeriodsOnMount();
  }, [username]);

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
      const updatedPeriod = await SeatingApi.updatePeriod(
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
      await SeatingApi.deletePeriod(username, period.periodId);
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
      const addedPeriod = await SeatingApi.createPeriod(username, data);
      await new Promise((resolve) => setTimeout(resolve, 0));
      if (addedPeriod) {
        try {
          let fetchedPeriods = await SeatingApi.getPeriods(username);
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
    <>
      <Flex direction="row" justifyContent="space-between" w="100vw">
        <Card mt={2} w="29%" id="forms">
          <CardBody mt={1} ml={1} p={1}>
            <form id="newPeriodForm" onSubmit={createPeriod}>
              <Center>
                <Heading mb={2} as="h3" size="md">
                  New Period
                </Heading>
              </Center>

              <Flex mb={2}>
                <FormLabel htmlFor="schoolYear" flex="29%">
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

              <Flex mb={2}>
                <FormLabel htmlFor="title" flex="29%">
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

              <Flex mb={2}>
                <FormLabel htmlFor="number" flex="30%">
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

              <Center>
                <Button mb={2} colorScheme="blue" onClick={createPeriod}>
                  Create Period
                </Button>
              </Center>
            </form>
          </CardBody>

          <CardBody m={1} p={2} key={selectedPeriod.id}>
            <form id="selectedPeriodForm">
              <Center>
                <Heading mb={2} as="h3" size="md">
                  Edit Period
                </Heading>
              </Center>

              <Flex mb={2}>
                <FormLabel htmlFor="schoolYear" flex="30%">
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

              <Flex mb={2}>
                <FormLabel htmlFor="title" flex="30%">
                  Class title:
                </FormLabel>
                <Input
                  flex="74%"
                  type="text"
                  id="titleInput"
                  value={selectedPeriod.title || ""}
                  onChange={(e) =>
                    setSelectedPeriod((p) => ({ ...p, title: e.target.value }))
                  }
                />
              </Flex>

              <Flex mb={2}>
                <FormLabel htmlFor="number" flex="30%">
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

              <Center>
                <Button
                  mb={2}
                  mr={2}
                  colorScheme="blue"
                  id="saveButton"
                  onClick={(e) => updatePeriod(e, selectedPeriod)}
                >
                  Save
                </Button>
                <Button
                  mb={2}
                  ml={2}
                  colorScheme="blue"
                  id="deleteButton"
                  onClick={(e) => deletePeriod(e, selectedPeriod)}
                >
                  Delete
                </Button>
              </Center>

              <Center>
                {formErrors.length ? <Alert messages={formErrors} /> : null}
                {saveConfirmed ? (
                  <Alert messages={["Changes saved successfully."]} />
                ) : null}
              </Center>
            </form>
          </CardBody>
        </Card>

        <Card m={3} w="69%" id="periodContainer">
          <Center>
            <Box mt={1} p={1} flex="1">
              <Center>
                <Heading>Enter Class Periods</Heading>
              </Center>
              <Container mt={2} maxW="4xl" centerContent>
                <Box padding="1" color="black">
                  Use this page to enter each of your course sections. Once
                  finished, hit the 'Add Students' Button to add student
                  rosters. Each period will populate below and can be modified
                  by hitting the 'Edit Period' button.
                </Box>
              </Container>
            </Box>
          </Center>
          <CardBody>
            <SimpleGrid columns={3} spacing={2}>
              {periods && Object.values(periods).length
                ? Object.values(periods).map((period, index) => (
                    <>
                      <Box py={4}>
                        <Box
                          maxW={"280px"}
                          w={"full"}
                          bg={"white"}
                          boxShadow={"2xl"}
                          rounded={"lg"}
                          p={2}
                          textAlign={"center"}
                        >
                          <Heading fontSize={"2xl"} fontFamily={"body"}>
                            Period {period.number}
                          </Heading>
                          <Center>
                            <Stack direction="row">
                              <Text fontWeight={600} color={"gray.500"} mb={2}>
                                {period.title}
                              </Text>
                              <Text fontWeight={600} color={"gray.500"}>
                                {period.schoolYear}
                              </Text>
                            </Stack>
                          </Center>

                          <Stack mt={2} direction={"row"} spacing={2}>
                            <Button
                              onClick={() => handleEdit(index)}
                              flex={1}
                              fontSize={"sm"}
                              _focus={{
                                bg: "gray.200",
                              }}
                            >
                              Edit Period
                            </Button>
                            <Button
                              onClick={() =>
                                navigate(`/periods/${period.periodId}`)
                              }
                              flex={1}
                              fontSize={"sm"}
                              bg={"blue.400"}
                              color={"white"}
                              boxShadow={
                                "0px 1px 25px -5px rgb(66 153 225 / 48%), 0 10px 10px -5px rgb(66 153 225 / 43%)"
                              }
                              _hover={{
                                bg: "blue.500",
                              }}
                              _focus={{
                                bg: "blue.500",
                              }}
                            >
                              Add Students
                            </Button>
                          </Stack>
                        </Box>
                        <Spacer />
                      </Box>
                    </>
                  ))
                : null}
            </SimpleGrid>
          </CardBody>
        </Card>
      </Flex>
    </>
  );
};

export default PeriodForm;
