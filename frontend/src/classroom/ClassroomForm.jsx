import { useState, useEffect, useContext, useCallback } from "react";
import Classroom from "./Classroom.jsx";
import ClassroomRedirect from "./ClassroomRedirect.jsx";
import useApi from "../hooks/useApi";
import UserContext from "../auth/UserContext";
import MakeAlert from "../common/MakeAlert";
import useAutosave from "../hooks/useAutosave";
import { useAppToast } from "../common/ToastContext";
import {
  Box,
  FormLabel,
  Heading,
  Text,
  VStack,
  HStack,
  RadioGroup,
  SimpleGrid,
  Radio,
  Button,
  Checkbox,
  Card,
  CardBody,
  Container,
  Stack,
  useColorModeValue,
} from "@chakra-ui/react";

//Parent component to ClassroomForm and ClassroomRedirect

const ClassroomForm = () => {
  const { currentUser } = useContext(UserContext);
  const { api } = useApi();
  const username = currentUser.username;
  const toast = useAppToast();

  // Color mode values
  const labelColor = useColorModeValue("brand.700", "brand.200");
  const textColor = useColorModeValue("brand.600", "brand.300");

  const [, setClassroom] = useState({});
  const [classroomId, setClassroomId] = useState("");
  const [formData, setFormData] = useState({});
  const [seatingConfig, setSeatingConfig] = useState(null);
  const [infoLoading, setInfoLoading] = useState(true);
  const [saveConfirmed, setSaveConfirmed] = useState(null);

  const updateSeatingConfig = (seatingConfig) => {
    if (seatingConfig) {
      setSeatingConfig(seatingConfig);
    }
  };

  // Autosave classroom layout when seatingConfig changes
  const handleAutosave = useCallback(async (config) => {
    if (!classroomId) return;

    try {
      await api.updateClassroom(username, classroomId, {
        seatingConfig: JSON.stringify(config),
      });
      toast.info("Layout auto-saved");
    } catch (err) {
      toast.error("Auto-save failed");
    }
  }, [classroomId, username, toast, api]);

  useAutosave(seatingConfig, handleAutosave, 2000, !!classroomId && !infoLoading);

  const getClassroomOnMount = useCallback(async () => {
    try {
      let classroom;
      try {
        classroom = await api.getClassroom(username);
      } catch {
        if (!classroom) {
          classroom = await api.createClassroom(username);
        }
      }

      setClassroom(classroom);
      setClassroomId(classroom.classroomId);
      // Parse seatingConfig if it's a JSON string
      const config = classroom.seatingConfig;
      const parsedConfig = typeof config === 'string' ? JSON.parse(config) : config;
      setSeatingConfig(parsedConfig);
      setFormDataFromModel(classroom);

      setInfoLoading(false);
    } catch (err) {
      toast.error(err.message || "Failed to load classroom");
    }
  }, [username, api, toast]);

  const setFormDataFromModel = (formModel) => {
    setFormData({
      classroomId: formModel.classroomId,
      seatAlphabetical: formModel.seatAlphabetical,
      seatRandomize: formModel.seatRandomize,
      seatHighLow: formModel.seatHighLow,
      seatMaleFemale: formModel.seatMaleFemale,
      eseIsPriority: formModel.eseIsPriority,
      ellIsPriority: formModel.ellIsPriority,
      fiveZeroFourIsPriority: formModel.fiveZeroFourIsPriority,
      ebdIsPriority: formModel.ebdIsPriority,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = {
      seatAlphabetical: formData.seatAlphabetical,
      seatRandomize: formData.seatRandomize,
      seatHighLow: formData.seatHighLow,
      seatMaleFemale: formData.seatMaleFemale,
      eseIsPriority: formData.eseIsPriority,
      ellIsPriority: formData.ellIsPriority,
      fiveZeroFourIsPriority: formData.fiveZeroFourIsPriority,
      ebdIsPriority: formData.ebdIsPriority,
      seatingConfig: JSON.stringify(seatingConfig),
    };

    try {
      const updatedClassroom = await api.updateClassroom(
        username,
        classroomId,
        data
      );
      setClassroom(updatedClassroom);
      setSaveConfirmed(["Changes saved successfully"]);
    } catch (err) {
      toast.error(err.message || "Failed to save classroom");
    }
  };

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;

    setFormData((prevFormData) => {
      if (type === "checkbox") {
        return {
          ...prevFormData,
          [name]: checked,
        };
      } else if (type === "radio" && name === "seatStyle") {
        let updatedState = {
          ...prevFormData,
          seatAlphabetical: false,
          seatRandomize: false,
          seatHighLow: false,
          seatMaleFemale: false,
        };
        switch (value) {
          case "Alphabetical":
            updatedState.seatAlphabetical = true;
            break;
          case "Random":
            updatedState.seatRandomize = true;
            break;
          case "High-Low":
            updatedState.seatHighLow = true;
            break;
          case "Male-Female":
            updatedState.seatMaleFemale = true;
            break;
          default:
            break;
        }

        return updatedState;
      }
    });
  };

  useEffect(() => {
    getClassroomOnMount();
  }, [username, getClassroomOnMount]);

  const seatStyleValue =
    (formData.seatAlphabetical && "Alphabetical") ||
    (formData.seatRandomize && "Random") ||
    (formData.seatHighLow && "High-Low") ||
    (formData.seatMaleFemale && "Male-Female") ||
    "";

  return (
    <Container maxW="7xl" py={{ base: 6, md: 8 }}>
      <Stack spacing={6}>
        <Box>
          <Heading size="xl">Classroom Setup</Heading>
          <Text color={textColor} mt={2} maxW="3xl">
            Choose seating priorities, build the room layout, then generate
            seating charts for each period.
          </Text>
        </Box>

        <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={5} alignItems="start">
          <Card>
            <CardBody>
              <VStack spacing={5} align="stretch">
                <Box>
                  <Heading size="md">Seating preferences</Heading>
                  <Text color="brand.500" fontSize="sm" mt={1}>
                    These rules guide the solver while leaving room for manual
                    teacher judgment.
                  </Text>
                </Box>

                <Box>
                  <FormLabel fontSize="sm" color={labelColor}>
                    Seat near front
                  </FormLabel>
                  <HStack spacing={4} flexWrap="wrap">
                    {[
                      ["eseIsPriority", "ESE"],
                      ["fiveZeroFourIsPriority", "504"],
                      ["ellIsPriority", "ELL"],
                      ["ebdIsPriority", "EBD"],
                    ].map(([name, label]) => (
                      <Checkbox
                        key={name}
                        colorScheme="accent"
                        name={name}
                        isChecked={!!formData[name]}
                        onChange={handleChange}
                        id={name}
                      >
                        {label}
                      </Checkbox>
                    ))}
                  </HStack>
                </Box>

                <Box>
                  <FormLabel fontSize="sm" color={labelColor}>
                    Seating style:
                  </FormLabel>
                  <RadioGroup
                    value={seatStyleValue}
                    onChange={(value) =>
                      handleChange({ target: { type: "radio", name: "seatStyle", value } })
                    }
                  >
                    <SimpleGrid columns={2} spacing={3} w="100%">
                      {["Alphabetical", "Random", "High-Low", "Male-Female"].map((value) => (
                        <Radio
                          key={value}
                          colorScheme="accent"
                          name="seatStyle"
                          value={value}
                          id={`seat${value.replace("-", "")}`}
                        >
                          {value}
                        </Radio>
                      ))}
                    </SimpleGrid>
                  </RadioGroup>
                </Box>

                <Button onClick={handleSubmit} type="submit">
                  Save Changes
                </Button>
                {saveConfirmed ? (
                  <MakeAlert status="success" variant="subtle" fontSize="md" messages={["Changes saved successfully."]} />
                ) : null}
                <Box w="100%" id="classroomRedirectButtons">
                  <ClassroomRedirect classroomId={classroomId} />
                </Box>
              </VStack>
            </CardBody>
          </Card>

          <Card gridColumn={{ base: "auto", lg: "span 2" }}>
            <CardBody>
              <Stack spacing={4}>
                <Box>
                  <Heading size="md">Room layout</Heading>
                  <Text color={textColor} mt={1}>
                    Select a desk type, then click cells to place or remove
                    desks. Layout changes autosave.
                  </Text>
                </Box>
                {seatingConfig && (
                  <Classroom
                    seatingConfig={seatingConfig}
                    updateSeatingConfig={updateSeatingConfig}
                  />
                )}
              </Stack>
            </CardBody>
          </Card>
        </SimpleGrid>
      </Stack>
    </Container>
  );
};

export default ClassroomForm;
