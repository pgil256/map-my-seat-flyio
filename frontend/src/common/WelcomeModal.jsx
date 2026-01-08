import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Text,
  VStack,
  HStack,
  Box,
  useDisclosure,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";

const WELCOME_SHOWN_KEY = "seating-welcome-shown";

function WelcomeModal() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [hasShown, setHasShown] = useState(true);

  useEffect(() => {
    const shown = localStorage.getItem(WELCOME_SHOWN_KEY);
    if (!shown) {
      setHasShown(false);
      onOpen();
    }
  }, [onOpen]);

  const handleClose = () => {
    localStorage.setItem(WELCOME_SHOWN_KEY, "true");
    setHasShown(true);
    onClose();
  };

  if (hasShown && !isOpen) return null;

  const steps = [
    {
      number: "1",
      title: "Set Up Classes",
      description: "Create class periods and add your student roster",
    },
    {
      number: "2",
      title: "Design Classroom",
      description: "Configure your room layout with desks and teacher desk",
    },
    {
      number: "3",
      title: "Generate Charts",
      description: "Create optimized seating arrangements for each class",
    },
  ];

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="lg" isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader textAlign="center" pt={6}>
          Welcome to Map My Seat!
        </ModalHeader>
        <ModalBody>
          <VStack spacing={6} align="stretch">
            <Text textAlign="center" color="gray.600">
              Create optimized seating charts for your classroom in three simple steps:
            </Text>

            <VStack spacing={4} align="stretch">
              {steps.map((step) => (
                <HStack key={step.number} spacing={4} align="start">
                  <Box
                    bg="blue.500"
                    color="white"
                    borderRadius="full"
                    w={8}
                    h={8}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    fontWeight="bold"
                    flexShrink={0}
                  >
                    {step.number}
                  </Box>
                  <Box>
                    <Text fontWeight="semibold">{step.title}</Text>
                    <Text fontSize="sm" color="gray.500">
                      {step.description}
                    </Text>
                  </Box>
                </HStack>
              ))}
            </VStack>
          </VStack>
        </ModalBody>
        <ModalFooter justifyContent="center" pb={6}>
          <Button colorScheme="blue" size="lg" onClick={handleClose}>
            Get Started
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default WelcomeModal;
