import { useState, useEffect, useContext, useCallback } from "react";
import Classroom from "./Classroom.jsx";
import ClassroomRedirect from "./ClassroomRedirect.jsx";
import useApi from "../hooks/useApi";
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
  Card,
  CardBody,
  useColorModeValue,
} from "@chakra-ui/react";

//Parent component to ClassroomForm and ClassroomRedirect

const ClassroomForm = () => {
  const { currentUser } = useContext(UserContext);
  const { api } = useApi();
  const username = currentUser.username;
  const toast = useAppToast();

  // Color mode values
  const cardBg = useColorModeValue("white", "brand.800");
  const cardBorder = useColorModeValue("brand.200", "brand.700");
  const labelColor = useColorModeValue("brand.700", "brand.200");
  const textColor = useColorModeValue("brand.600", "brand.300");

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
      await api.updateClassroom(username, classroomId, {
        seatingConfig: JSON.stringify(config),
      });
      toast.info("Layout auto-saved");
    } catch (err) {
      console.error("Autosave failed:", err);
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
      console.error(
        "Error while retrieving or creating classroom:",
        err.message
      );
    }
  }, [username, api]);

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
    <Flex maxH="85vh" maxW="95%" m={4} direction="row" gap={6}>
      {/* Settings Card */}
      <Card p={6} minW="320px" maxW="400px">
        <CardBody>
          <VStack spacing={5} align="stretch">
            <FormLabel fontSize="lg" color={labelColor} mb={0}>
              Seat near front:
            </FormLabel>
            <HStack spacing={5}>
              <Checkbox
                colorScheme="brand"
                name="eseIsPriority"
                isChecked={formData.eseIsPriority}
                onChange={handleChange}
                id="eseIsPriority"
              >
                ESE
              </Checkbox>

              <Checkbox
                colorScheme="brand"
                name="fiveZeroFourIsPriority"
                isChecked={formData.fiveZeroFourIsPriority}
                onChange={handleChange}
                id="fiveZeroFourIsPriority"
              >
                504
              </Checkbox>

              <Checkbox
                colorScheme="brand"
                name="ellIsPriority"
                isChecked={formData.ellIsPriority}
                onChange={handleChange}
                id="ellIsPriority"
              >
                ELL
              </Checkbox>

              <Checkbox
                colorScheme="brand"
                name="ebdIsPriority"
                isChecked={formData.ebdIsPriority}
                onChange={handleChange}
                id="ebdIsPriority"
              >
                EBD
              </Checkbox>
            </HStack>

            <FormLabel fontSize="lg" color={labelColor} mb={0}>
              Seating style:
            </FormLabel>
            <RadioGroup>
              <SimpleGrid columns={2} spacing={4} w="100%">
                <Radio
                  colorScheme="brand"
                  name="seatStyle"
                  value="Alphabetical"
                  isChecked={formData.seatAlphabetical === "Alphabetical"}
                  onChange={handleChange}
                  id="seatAlphabetical"
                >
                  Alphabetical
                </Radio>

                <Radio
                  colorScheme="brand"
                  name="seatStyle"
                  value="Random"
                  isChecked={formData.seatRandomize === "Random"}
                  onChange={handleChange}
                  id="seatRandomize"
                >
                  Random
                </Radio>

                <Radio
                  colorScheme="brand"
                  name="seatStyle"
                  value="High-Low"
                  isChecked={formData.seatHighLow === "High-Low"}
                  onChange={handleChange}
                  id="seatHighLow"
                >
                  High-Low
                </Radio>

                <Radio
                  colorScheme="brand"
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
                variant="solid"
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
        </CardBody>
      </Card>

      {/* Classroom Grid Card */}
      <Card p={6} flex={1}>
        <CardBody>
          <Center>
            <Heading size="lg" mb={4}>Classroom Setup</Heading>
          </Center>
          <Text color={textColor} mb={4}>
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
        </CardBody>
      </Card>
    </Flex>
  );
};

export default ClassroomForm;
