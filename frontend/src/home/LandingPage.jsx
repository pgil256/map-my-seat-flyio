import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Icon,
  SimpleGrid,
  Stack,
  Text,
  VStack,
  HStack,
  Circle,
  useColorModeValue,
} from "@chakra-ui/react";
import {
  TimeIcon,
  SettingsIcon,
  ViewIcon,
  CheckCircleIcon,
} from "@chakra-ui/icons";
import { useDemo } from "../demo/DemoContext";

// Feature card component
function Feature({ icon, title, description }) {
  return (
    <VStack
      p={6}
      bg={useColorModeValue("white", "gray.800")}
      borderRadius="lg"
      boxShadow="md"
      spacing={4}
      align="start"
      _hover={{ transform: "translateY(-4px)", boxShadow: "lg" }}
      transition="all 0.2s"
    >
      <Circle size={12} bg="green.100" color="green.600">
        <Icon as={icon} boxSize={6} />
      </Circle>
      <Heading size="md">{title}</Heading>
      <Text color="gray.600">{description}</Text>
    </VStack>
  );
}

// Step component for "How it works"
function Step({ number, title, description }) {
  return (
    <VStack spacing={3} textAlign="center">
      <Circle
        size={14}
        bg="green.400"
        color="white"
        fontWeight="bold"
        fontSize="xl"
      >
        {number}
      </Circle>
      <Heading size="md">{title}</Heading>
      <Text color="gray.600" maxW="250px">
        {description}
      </Text>
    </VStack>
  );
}

export default function LandingPage() {
  const navigate = useNavigate();
  const { startDemo } = useDemo();
  const bgGradient = useColorModeValue(
    "linear(to-b, green.50, white)",
    "linear(to-b, gray.900, gray.800)"
  );

  const handleTryDemo = () => {
    startDemo();
    navigate("/classes");
  };

  return (
    <Box>
      {/* Hero Section */}
      <Box bgGradient={bgGradient} pt={20} pb={16}>
        <Container maxW="6xl">
          <Stack
            direction={{ base: "column", lg: "row" }}
            spacing={12}
            align="center"
          >
            <VStack align="start" spacing={6} flex={1}>
              <Heading
                as="h1"
                size="3xl"
                fontWeight="800"
                lineHeight="1.1"
              >
                Seating charts{" "}
                <Text as="span" color="green.400">
                  made easy
                </Text>
              </Heading>
              <Text fontSize="xl" color="gray.600" maxW="lg">
                Create optimized classroom seating arrangements in minutes. 
                Import your roster, set your preferences, and let Map My Seat 
                do the rest.
              </Text>
              <HStack spacing={4} pt={4} flexWrap="wrap">
                <Button
                  size="lg"
                  colorScheme="green"
                  onClick={() => navigate("/signup")}
                  px={8}
                >
                  Get Started Free
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  colorScheme="green"
                  onClick={() => navigate("/login")}
                >
                  Log In
                </Button>
                <Button
                  size="lg"
                  variant="ghost"
                  colorScheme="green"
                  onClick={handleTryDemo}
                >
                  Try Demo
                </Button>
              </HStack>
              <HStack spacing={6} pt={2} color="gray.500" fontSize="sm">
                <HStack>
                  <CheckCircleIcon color="green.400" />
                  <Text>No credit card required</Text>
                </HStack>
                <HStack>
                  <CheckCircleIcon color="green.400" />
                  <Text>Free for teachers</Text>
                </HStack>
              </HStack>
            </VStack>

            {/* App Preview/Mockup */}
            <Box
              flex={1}
              bg="white"
              p={4}
              borderRadius="xl"
              boxShadow="2xl"
              maxW="500px"
            >
              <Box
                bg="gray.100"
                borderRadius="lg"
                p={6}
                minH="300px"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <VStack spacing={4}>
                  <SimpleGrid columns={4} spacing={2}>
                    {[...Array(16)].map((_, i) => (
                      <Box
                        key={i}
                        w={10}
                        h={8}
                        bg={i % 5 === 0 ? "green.300" : "gray.300"}
                        borderRadius="sm"
                      />
                    ))}
                  </SimpleGrid>
                  <Text fontSize="sm" color="gray.500" fontWeight="medium">
                    Classroom Layout Preview
                  </Text>
                </VStack>
              </Box>
            </Box>
          </Stack>
        </Container>
      </Box>

      {/* Features Section */}
      <Box py={20}>
        <Container maxW="6xl">
          <VStack spacing={4} mb={12} textAlign="center">
            <Heading size="xl">Why teachers love Map My Seat</Heading>
            <Text fontSize="lg" color="gray.600" maxW="2xl">
              Built by educators, for educators. Save hours of manual seating 
              arrangement with smart automation.
            </Text>
          </VStack>

          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8}>
            <Feature
              icon={TimeIcon}
              title="Save Hours"
              description="Generate optimized seating charts in minutes instead of hours. Update arrangements with a single click."
            />
            <Feature
              icon={SettingsIcon}
              title="Smart Seating"
              description="Automatically accommodate IEPs, 504 plans, ELL students, and behavior considerations."
            />
            <Feature
              icon={ViewIcon}
              title="Flexible Layouts"
              description="Design any classroom layout - rows, groups, U-shapes, or custom arrangements."
            />
          </SimpleGrid>
        </Container>
      </Box>

      {/* How It Works Section */}
      <Box py={20} bg={useColorModeValue("gray.50", "gray.900")}>
        <Container maxW="6xl">
          <VStack spacing={4} mb={16} textAlign="center">
            <Heading size="xl">How it works</Heading>
            <Text fontSize="lg" color="gray.600">
              Three simple steps to your perfect seating chart
            </Text>
          </VStack>

          <Flex
            direction={{ base: "column", md: "row" }}
            justify="center"
            align={{ base: "center", md: "start" }}
            gap={12}
          >
            <Step
              number="1"
              title="Add Your Students"
              description="Import your class roster or add students manually with their accommodation needs."
            />
            <Step
              number="2"
              title="Design Your Classroom"
              description="Create your classroom layout by placing desks, tables, and the teacher station."
            />
            <Step
              number="3"
              title="Generate Charts"
              description="Click generate and get an optimized seating arrangement based on your preferences."
            />
          </Flex>

          <VStack mt={16}>
            <Button
              size="lg"
              colorScheme="green"
              onClick={() => navigate("/signup")}
              px={10}
            >
              Start Creating Seating Charts
            </Button>
          </VStack>
        </Container>
      </Box>

      {/* Footer */}
      <Box py={12} borderTop="1px" borderColor="gray.200">
        <Container maxW="6xl">
          <Flex
            direction={{ base: "column", md: "row" }}
            justify="space-between"
            align="center"
            gap={4}
          >
            <Text fontWeight="bold" fontSize="lg" color="green.500">
              Map My Seat
            </Text>
            <HStack spacing={6} color="gray.600">
              <Text 
                cursor="pointer" 
                _hover={{ color: "green.500" }}
                onClick={() => navigate("/login")}
              >
                Login
              </Text>
              <Text 
                cursor="pointer" 
                _hover={{ color: "green.500" }}
                onClick={() => navigate("/signup")}
              >
                Sign Up
              </Text>
            </HStack>
            <Text fontSize="sm" color="gray.500">
              © {new Date().getFullYear()} Map My Seat. Built for teachers.
            </Text>
          </Flex>
        </Container>
      </Box>
    </Box>
  );
}
