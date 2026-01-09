import { useState, useEffect, useContext, useCallback } from "react";
import Classroom from "./Classroom.jsx";
import ClassroomRedirect from "./ClassroomRedirect.jsx";
import SeatingApi from "../api.js";
import UserContext from "../auth/UserContext";
import MakeAlert from "../common/MakeAlert";
import useAutosave from "../hooks/useAutosave";
import { useAppToast } from "../common/ToastContext";
import {
  Center,
  Box,
  FormLabel,
  Flex,
  Heading,
  Text,
  VStack,
  HStack,
  RadioGroup,
  SimpleGrid,
  Radio,
  Button,
  Checkbox,
} from "@chakra-ui/react";

//Parent component to ClassroomForm and ClassroomRedirect

const ClassroomForm = () => {
  const { currentUser } = useContext(UserContext);
  const username = currentUser.username;
  const toast = useAppToast();

  const [classroom, setClassroom] = useState({});
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
      await SeatingApi.updateClassroom(username, classroomId, {
        seatingConfig: JSON.stringify(config),
      });
      toast.info("Layout auto-saved");
    } catch (err) {
      console.error("Autosave failed:", err);
    }
  }, [classroomId, username, toast]);

  useAutosave(seatingConfig, handleAutosave, 2000, !!classroomId && !infoLoading);

  const getClassroomOnMount = useCallback(async () => {
    try {
      let classroom;
      try {
        classroom = await SeatingApi.getClassroom(username);
      } catch {
        if (!classroom) {
          classroom = await SeatingApi.createClassroom(username);
        }
      }

      setClassroom(classroom);
      setClassroomId(classroom.classroomId);
      setSeatingConfig(classroom.seatingConfig);
      setFormDataFromModel(classroom);

      setInfoLoading(false);
    } catch (err) {
      console.error(
        "Error while retrieving or creating classroom:",
        err.message
      );
    }
  }, [username]);

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
      const updatedClassroom = await SeatingApi.updateClassroom(
        username,
        classroomId,
        data
      );
      setClassroom(updatedClassroom);
      setSaveConfirmed(["Changes saved successfully"]);
    } catch (err) {
      console.error("Classroom update failed", err);
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
  }, [username]);

  return (
    <>
      <Flex maxH={"85vh"} maxW="75%" m={1} direction="row">
        <Box
          mt={2}
          w="50%"
          mx="auto"
          bg="gray.100"
          borderRadius="lg"
          boxShadow="lg"
          p={3}
        >
          <Box
            maxH={"80vh"}
            borderColor="gray.200"
            p={3}
            borderRadius="sm"
            bg="white"
          >
            <VStack spacing={5} align="stretch">
              <FormLabel fontSize="xl" color="gray.700">
                Seat near front:
              </FormLabel>
              <HStack spacing={5}>
                <Checkbox
                  colorScheme="green"
                  name="eseIsPriority"
                  isChecked={formData.eseIsPriority}
                  onChange={handleChange}
                  id="eseIsPriority"
                >
                  ESE
                </Checkbox>

                <Checkbox
                  colorScheme="green"
                  name="fiveZeroFourIsPriority"
                  isChecked={formData.fiveZeroFourIsPriority}
                  onChange={handleChange}
                  id="fiveZeroFourIsPriority"
                >
                  504
                </Checkbox>

                <Checkbox
                  colorScheme="green"
                  name="ellIsPriority"
                  isChecked={formData.ellIsPriority}
                  onChange={handleChange}
                  id="ellIsPriority"
                >
                  ELL
                </Checkbox>

                <Checkbox
                  colorScheme="green"
                  name="ebdIsPriority"
                  isChecked={formData.ebdIsPriority}
                  onChange={handleChange}
                  id="ebdIsPriority"
                >
                  EBD
                </Checkbox>
              </HStack>

              <FormLabel fontSize="xl" color="gray.700">
                Seating style:
              </FormLabel>
              <RadioGroup>
                <SimpleGrid columns={2} spacing={4} w="100%">
                  <Radio
                    colorScheme="blue"
                    name="seatStyle"
                    value="Alphabetical"
                    isChecked={formData.seatAlphabetical === "Alphabetical"}
                    onChange={handleChange}
                    id="seatAlphabetical"
                  >
                    Alphabetical
                  </Radio>

                  <Radio
                    colorScheme="blue"
                    name="seatStyle"
                    value="Random"
                    isChecked={formData.seatRandomize === "Random"}
                    onChange={handleChange}
                    id="seatRandomize"
                  >
                    Random
                  </Radio>

                  <Radio
                    colorScheme="blue"
                    name="seatStyle"
                    value="High-Low"
                    isChecked={formData.seatHighLow === "High-Low"}
                    onChange={handleChange}
                    id="seatHighLow"
                  >
                    High-Low
                  </Radio>

                  <Radio
                    colorScheme="blue"
                    name="seatStyle"
                    value="Male-Female"
                    isChecked={formData.seatMaleFemale === "Male-Female"}
                    onChange={handleChange}
                    id="seatMaleFemale"
                  >
                    Male-Female
                  </Radio>
                </SimpleGrid>
              </RadioGroup>

              <Center>
                <Button
                  onClick={handleSubmit}
                  w="50%"
                  colorScheme="purple"
                  type="submit"
                >
                  Save Changes
                </Button>
              </Center>
                            {saveConfirmed ? (
                  <MakeAlert status="success" variant="subtle" fontSize="md" messages={["Changes saved successfully."]} />
                ) : null}
              <Box w="100%" id="classroomRedirectButtons">
                <ClassroomRedirect classroomId={classroomId} />
              </Box>
            </VStack>
          </Box>
        </Box>

        <Box
          id="seatingChartBox"
          w="100%"
          h="100%"
          mb={3}
          ml={5}
          p={1}
          bg="white"
          borderRadius="sm"
          boxShadow="lg"
        >
          <Center>
            <Heading>Classroom Setup</Heading>
          </Center>
          <Text>
            Use this page to add seating configuration settings. Click the
            buttons and table below to add the layout of your classroom. The
            form to the left serves to orient students by gender, grade,
            alphabetically, or randomly. Any student categorized as "priority"
            will be seated towards the front of the class.
          </Text>
          {seatingConfig && (
            <Classroom
              seatingConfig={seatingConfig}
              updateSeatingConfig={updateSeatingConfig}
            />
          )}
        </Box>
      </Flex>
    </>
  );
};

export default ClassroomForm;
