import {
  Box,
  HStack,
  VStack,
  Text,
  Progress,
  Circle,
  useColorModeValue,
} from "@chakra-ui/react";
import { CheckIcon } from "@chakra-ui/icons";
import { Link as RouterLink } from "react-router-dom";

function SetupProgress({ hasPeriods, hasStudents, hasClassroom, username }) {
  const bg = useColorModeValue("white", "brand.800");
  const border = useColorModeValue("brand.200", "brand.700");
  const labelColor = useColorModeValue("brand.700", "brand.200");
  const subtleColor = useColorModeValue("brand.500", "brand.400");
  const linkColor = useColorModeValue("accent.600", "accent.300");
  const doneColor = useColorModeValue("brand.500", "brand.400");
  const todoColor = useColorModeValue("brand.700", "brand.200");
  const dotIdle = useColorModeValue("brand.200", "brand.600");

  const steps = [
    {
      label: "Create Period",
      done: hasPeriods,
      link: "/periods",
    },
    {
      label: "Add Students",
      done: hasStudents,
      link: hasPeriods ? "/periods" : null,
    },
    {
      label: "Setup Classroom",
      done: hasClassroom,
      link: `/classrooms/${username}`,
    },
  ];

  const completedCount = steps.filter((s) => s.done).length;
  const progressPercent = (completedCount / steps.length) * 100;

  if (completedCount === steps.length) {
    return null;
  }

  return (
    <Box
      bg={bg}
      p={6}
      borderRadius="lg"
      boxShadow="card"
      border="1px"
      borderColor={border}
      maxW="md"
      w="full"
    >
      <VStack spacing={4} align="stretch">
        <HStack justify="space-between">
          <Text fontWeight="semibold" color={labelColor}>
            Getting Started
          </Text>
          <Text fontSize="sm" color={subtleColor}>
            {completedCount} of {steps.length} complete
          </Text>
        </HStack>

        <Progress
          value={progressPercent}
          colorScheme="success"
          borderRadius="full"
          size="sm"
        />

        <VStack spacing={3} align="stretch">
          {steps.map((step) => (
            <HStack key={step.label} spacing={3}>
              <Circle
                size={6}
                bg={step.done ? "success.500" : dotIdle}
                color="white"
              >
                {step.done && <CheckIcon boxSize={3} />}
              </Circle>
              {step.link && !step.done ? (
                <Text
                  as={RouterLink}
                  to={step.link}
                  color={linkColor}
                  _hover={{ textDecoration: "underline" }}
                  fontSize="sm"
                >
                  {step.label}
                </Text>
              ) : (
                <Text
                  fontSize="sm"
                  color={step.done ? doneColor : todoColor}
                  textDecoration={step.done ? "line-through" : "none"}
                >
                  {step.label}
                </Text>
              )}
            </HStack>
          ))}
        </VStack>
      </VStack>
    </Box>
  );
}

export default SetupProgress;
