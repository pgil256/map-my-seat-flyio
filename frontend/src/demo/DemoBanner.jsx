import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  HStack,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import { InfoIcon } from "@chakra-ui/icons";
import { useDemo } from "./DemoContext";

export default function DemoBanner() {
  const { isDemo, exitDemo } = useDemo();
  const navigate = useNavigate();
  const bgColor = useColorModeValue("orange.100", "orange.800");
  const textColor = useColorModeValue("orange.800", "orange.100");

  if (!isDemo) return null;

  const handleSignUp = () => {
    exitDemo();
    navigate("/signup");
  };

  const handleExit = () => {
    exitDemo();
    navigate("/");
  };

  return (
    <Box
      bg={bgColor}
      color={textColor}
      py={2}
      px={4}
      position="sticky"
      top={0}
      zIndex={1000}
    >
      <HStack justify="center" spacing={4} flexWrap="wrap">
        <HStack>
          <InfoIcon />
          <Text fontWeight="medium">
            You&apos;re exploring in demo mode. Changes won&apos;t be saved.
          </Text>
        </HStack>
        <HStack spacing={2}>
          <Button
            size="sm"
            colorScheme="green"
            onClick={handleSignUp}
          >
            Sign Up to Save
          </Button>
          <Button
            size="sm"
            variant="outline"
            colorScheme="orange"
            onClick={handleExit}
          >
            Exit Demo
          </Button>
        </HStack>
      </HStack>
    </Box>
  );
}
