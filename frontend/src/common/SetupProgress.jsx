import {
  Box,
  HStack,
  VStack,
  Text,
  Progress,
  Circle,
} from "@chakra-ui/react";
import { CheckIcon } from "@chakra-ui/icons";
import { Link as RouterLink } from "react-router-dom";

function SetupProgress({ hasPeriods, hasStudents, hasClassroom, username }) {
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
      bg="white"
      p={6}
      borderRadius="lg"
      boxShadow="sm"
      border="1px"
      borderColor="gray.200"
      maxW="md"
      w="full"
    >
      <VStack spacing={4} align="stretch">
        <HStack justify="space-between">
          <Text fontWeight="semibold" color="gray.700">
            Getting Started
          </Text>
          <Text fontSize="sm" color="gray.500">
            {completedCount} of {steps.length} complete
          </Text>
        </HStack>

        <Progress
          value={progressPercent}
          colorScheme="green"
          borderRadius="full"
          size="sm"
        />

        <VStack spacing={3} align="stretch">
          {steps.map((step) => (
            <HStack key={step.label} spacing={3}>
              <Circle
                size={6}
                bg={step.done ? "green.500" : "gray.200"}
                color="white"
              >
                {step.done && <CheckIcon boxSize={3} />}
              </Circle>
              {step.link && !step.done ? (
                <Text
                  as={RouterLink}
                  to={step.link}
                  color="blue.500"
                  _hover={{ textDecoration: "underline" }}
                  fontSize="sm"
                >
                  {step.label}
                </Text>
              ) : (
                <Text
                  fontSize="sm"
                  color={step.done ? "gray.500" : "gray.600"}
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
