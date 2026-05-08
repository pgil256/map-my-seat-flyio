import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Icon,
  Image,
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
} from "@chakra-ui/icons";
import { useDemo } from "../demo/DemoContext";

// Feature card component
function Feature({ icon, title, description }) {
  const cardBg = useColorModeValue("white", "brand.800");
  const iconBg = useColorModeValue("accent.100", "accent.900");
  const iconColor = useColorModeValue("accent.600", "accent.400");
  const headingColor = useColorModeValue("brand.800", "brand.100");
  const textColor = useColorModeValue("brand.600", "brand.300");

  return (
    <VStack
      p={6}
      bg={cardBg}
      borderRadius="lg"
      boxShadow="md"
      spacing={4}
      align="start"
      _hover={{ transform: "translateY(-4px)", boxShadow: "lg" }}
      transition="all 0.2s"
    >
      <Circle size={12} bg={iconBg} color={iconColor}>
        <Icon as={icon} boxSize={6} />
      </Circle>
      <Heading size="md" color={headingColor}>{title}</Heading>
      <Text color={textColor}>{description}</Text>
    </VStack>
  );
}

// Step component for "How it works"
function Step({ number, title, description }) {
  const circleBg = useColorModeValue("accent.500", "accent.600");
  const headingColor = useColorModeValue("brand.800", "brand.100");
  const textColor = useColorModeValue("brand.600", "brand.300");

  return (
    <VStack spacing={3} textAlign="center">
      <Circle
        size={14}
        bg={circleBg}
        color="white"
        fontWeight="bold"
        fontSize="xl"
      >
        {number}
      </Circle>
      <Heading size="md" color={headingColor}>{title}</Heading>
      <Text color={textColor} maxW="250px">
        {description}
      </Text>
    </VStack>
  );
}

export default function LandingPage() {
  const navigate = useNavigate();
  const { startDemo } = useDemo();

  // Color mode values
  const bgGradient = useColorModeValue(
    "linear(to-b, brand.100, brand.50)",
    "linear(to-b, brand.900, brand.800)"
  );
  const heroTextColor = useColorModeValue("brand.600", "brand.300");
  const sectionHeadingColor = useColorModeValue("brand.800", "brand.100");
  const subtleTextColor = useColorModeValue("brand.500", "brand.400");
  const sectionTextColor = useColorModeValue("brand.600", "brand.300");
  const sectionBg = useColorModeValue("brand.50", "brand.900");
  const previewBorderColor = useColorModeValue("brand.200", "brand.700");
  const footerBorderColor = useColorModeValue("brand.200", "brand.700");
  const footerLinkColor = useColorModeValue("brand.600", "brand.300");
  const footerLinkHoverColor = useColorModeValue("accent.600", "accent.400");
  const brandTextColor = useColorModeValue("brand.700", "brand.200");

  const handleTryDemo = () => {
    startDemo();
    navigate("/classrooms/1/seating-charts/1");
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
                color={sectionHeadingColor}
              >
                Seating charts in minutes.
              </Heading>
              <Text fontSize="xl" color={heroTextColor} maxW="lg">
                Import a roster, set "keep apart" and "seat together" rules,
                and generate an optimized arrangement.
              </Text>
              <HStack spacing={4} pt={4} flexWrap="wrap">
                <Button
                  size="lg"
                  variant="solid"
                  onClick={() => navigate("/signup")}
                  px={8}
                >
                  Sign up
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => navigate("/login")}
                >
                  Log in
                </Button>
                <Button
                  size="lg"
                  variant="ghost"
                  onClick={handleTryDemo}
                >
                  Try demo
                </Button>
              </HStack>
            </VStack>

            <Box
              flex={1}
              borderRadius="xl"
              boxShadow="2xl"
              overflow="hidden"
              borderWidth="1px"
              borderColor={previewBorderColor}
              maxW="600px"
            >
              <Image
                src="/seating-preview.png"
                alt="Seating chart with arrangement score and per-desk rationale"
                w="100%"
                h="auto"
                display="block"
              />
            </Box>
          </Stack>
        </Container>
      </Box>

      {/* Features Section */}
      <Box py={20}>
        <Container maxW="6xl">
          <VStack spacing={4} mb={12} textAlign="center">
            <Heading size="xl" color={sectionHeadingColor}>
              Features
            </Heading>
            <Text fontSize="lg" color={sectionTextColor} maxW="2xl">
              A solver, accommodation flags, and a flexible layout editor —
              built around how teachers actually arrange a room.
            </Text>
          </VStack>

          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8}>
            <Feature
              icon={TimeIcon}
              title="Constraint solver"
              description="Simulated annealing places students against keep-apart, seat-together, and accommodation rules."
            />
            <Feature
              icon={SettingsIcon}
              title="Accommodations"
              description="ESE, ELL, 504, and EBD flags get priority placement with per-desk rationale."
            />
            <Feature
              icon={ViewIcon}
              title="Flexible layouts"
              description="Build rows, groups, U-shapes, or any custom arrangement on a grid editor with autosave."
            />
          </SimpleGrid>
        </Container>
      </Box>

      {/* How It Works Section */}
      <Box py={20} bg={sectionBg}>
        <Container maxW="6xl">
          <VStack spacing={4} mb={16} textAlign="center">
            <Heading size="xl" color={sectionHeadingColor}>
              How it works
            </Heading>
            <Text fontSize="lg" color={sectionTextColor} maxW="xl">
              Three steps from roster to printable chart.
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
              title="Add students"
              description="Import a roster or add students manually with accommodation flags."
            />
            <Step
              number="2"
              title="Design the room"
              description="Place desks, tables, and the teacher station on a grid."
            />
            <Step
              number="3"
              title="Generate"
              description="Run the solver and adjust by hand with drag-to-swap."
            />
          </Flex>

          <VStack mt={16}>
            <Button
              size="lg"
              variant="accent"
              onClick={() => navigate("/signup")}
              px={10}
            >
              Sign up
            </Button>
          </VStack>
        </Container>
      </Box>

      {/* Footer */}
      <Box py={12} borderTop="1px" borderColor={footerBorderColor}>
        <Container maxW="6xl">
          <Flex
            direction={{ base: "column", md: "row" }}
            justify="space-between"
            align="center"
            gap={4}
          >
            <Text fontWeight="bold" fontSize="lg" color={brandTextColor}>
              Map My Seat
            </Text>
            <HStack spacing={6} color={footerLinkColor}>
              <Text
                cursor="pointer"
                _hover={{ color: footerLinkHoverColor }}
                onClick={() => navigate("/login")}
              >
                Log in
              </Text>
              <Text
                cursor="pointer"
                _hover={{ color: footerLinkHoverColor }}
                onClick={() => navigate("/signup")}
              >
                Sign up
              </Text>
            </HStack>
            <Text fontSize="sm" color={subtleTextColor}>
              &copy; {new Date().getFullYear()} Map My Seat
            </Text>
          </Flex>
        </Container>
      </Box>
    </Box>
  );
}
