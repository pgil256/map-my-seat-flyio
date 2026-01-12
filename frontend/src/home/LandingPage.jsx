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
  const heroHighlightColor = useColorModeValue("accent.600", "accent.400");
  const heroTextColor = useColorModeValue("brand.600", "brand.300");
  const sectionHeadingColor = useColorModeValue("brand.800", "brand.100");
  const sectionTextColor = useColorModeValue("brand.600", "brand.300");
  const checkIconColor = useColorModeValue("accent.500", "accent.400");
  const subtleTextColor = useColorModeValue("brand.500", "brand.400");
  const sectionBg = useColorModeValue("brand.50", "brand.900");
  const previewBg = useColorModeValue("white", "brand.700");
  const previewInnerBg = useColorModeValue("brand.100", "brand.800");
  const deskHighlight = useColorModeValue("accent.400", "accent.500");
  const deskDefault = useColorModeValue("brand.300", "brand.600");
  const footerBorderColor = useColorModeValue("brand.200", "brand.700");
  const footerLinkColor = useColorModeValue("brand.600", "brand.300");
  const footerLinkHoverColor = useColorModeValue("accent.600", "accent.400");
  const brandTextColor = useColorModeValue("brand.700", "brand.200");

  const handleTryDemo = () => {
    startDemo();
    navigate("/periods");
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
                Seating charts{" "}
                <Text as="span" color={heroHighlightColor}>
                  made easy
                </Text>
              </Heading>
              <Text fontSize="xl" color={heroTextColor} maxW="lg">
                Create optimized classroom seating arrangements in minutes.
                Import your roster, set your preferences, and let Map My Seat
                do the rest.
              </Text>
              <HStack spacing={4} pt={4} flexWrap="wrap">
                <Button
                  size="lg"
                  variant="solid"
                  onClick={() => navigate("/signup")}
                  px={8}
                >
                  Get Started Free
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => navigate("/login")}
                >
                  Log In
                </Button>
                <Button
                  size="lg"
                  variant="ghost"
                  onClick={handleTryDemo}
                >
                  Try Demo
                </Button>
              </HStack>
              <HStack spacing={6} pt={2} color={subtleTextColor} fontSize="sm">
                <HStack>
                  <CheckCircleIcon color={checkIconColor} />
                  <Text>No credit card required</Text>
                </HStack>
                <HStack>
                  <CheckCircleIcon color={checkIconColor} />
                  <Text>Free for teachers</Text>
                </HStack>
              </HStack>
            </VStack>

            {/* App Preview/Mockup */}
            <Box
              flex={1}
              bg={previewBg}
              p={4}
              borderRadius="xl"
              boxShadow="2xl"
              maxW="500px"
            >
              <Box
                bg={previewInnerBg}
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
                        bg={i % 5 === 0 ? deskHighlight : deskDefault}
                        borderRadius="sm"
                      />
                    ))}
                  </SimpleGrid>
                  <Text fontSize="sm" color={subtleTextColor} fontWeight="medium">
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
            <Heading size="xl" color={sectionHeadingColor}>
              Why teachers love Map My Seat
            </Heading>
            <Text fontSize="lg" color={sectionTextColor} maxW="2xl">
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
      <Box py={20} bg={sectionBg}>
        <Container maxW="6xl">
          <VStack spacing={4} mb={16} textAlign="center">
            <Heading size="xl" color={sectionHeadingColor}>
              How it works
            </Heading>
            <Text fontSize="lg" color={sectionTextColor}>
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
              variant="accent"
              onClick={() => navigate("/signup")}
              px={10}
            >
              Start Creating Seating Charts
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
                Login
              </Text>
              <Text
                cursor="pointer"
                _hover={{ color: footerLinkHoverColor }}
                onClick={() => navigate("/signup")}
              >
                Sign Up
              </Text>
            </HStack>
            <Text fontSize="sm" color={subtleTextColor}>
              &copy; {new Date().getFullYear()} Map My Seat. Built for teachers.
            </Text>
          </Flex>
        </Container>
      </Box>
    </Box>
  );
}
