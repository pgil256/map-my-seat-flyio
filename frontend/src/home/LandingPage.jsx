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
} from "@chakra-ui/icons";
import { useDemo } from "../demo/DemoContext";
import HeroPreview from "./HeroPreview";

function Feature({ icon, title, description, tintBg, tintFg }) {
  const cardBg = useColorModeValue("white", "brand.800");
  const headingColor = useColorModeValue("brand.800", "brand.100");
  const textColor = useColorModeValue("brand.600", "brand.300");
  const borderColor = useColorModeValue("brand.200", "brand.700");

  return (
    <VStack
      p={7}
      bg={cardBg}
      borderRadius="md"
      boxShadow="sm"
      borderWidth="1px"
      borderColor={borderColor}
      spacing={4}
      align="start"
      transition="border-color 0.15s ease, box-shadow 0.15s ease"
      _hover={{ boxShadow: "md", borderColor: tintFg }}
      className="lp-fade-in"
    >
      <Circle size={12} bg={tintBg} color={tintFg}>
        <Icon as={icon} boxSize={6} />
      </Circle>
      <Heading size="md" color={headingColor}>{title}</Heading>
      <Text color={textColor} lineHeight="tall">{description}</Text>
    </VStack>
  );
}

function Step({ number, title, description, last }) {
  const circleBg = useColorModeValue("accent.500", "accent.500");
  const headingColor = useColorModeValue("brand.800", "brand.100");
  const textColor = useColorModeValue("brand.600", "brand.300");
  const lineColor = useColorModeValue("brand.300", "brand.600");

  return (
    <VStack spacing={3} textAlign="center" position="relative" flex={1} minW={{ base: "auto", md: "200px" }}>
      <Circle
        size={14}
        bg={circleBg}
        color="white"
        fontWeight="bold"
        fontSize="xl"
        boxShadow="md"
        zIndex={1}
      >
        {number}
      </Circle>
      {!last && (
        <Box
          display={{ base: "none", md: "block" }}
          position="absolute"
          top="28px"
          left="calc(50% + 28px)"
          right="calc(-50% + 28px)"
          h="2px"
          borderTop="2px dashed"
          borderColor={lineColor}
          zIndex={0}
        />
      )}
      <Heading size="md" color={headingColor}>{title}</Heading>
      <Text color={textColor} maxW="250px" lineHeight="tall">
        {description}
      </Text>
    </VStack>
  );
}

export default function LandingPage() {
  const navigate = useNavigate();
  const { startDemo } = useDemo();

  const heroBg = useColorModeValue("white", "brand.900");
  const heroBorderColor = useColorModeValue("brand.200", "brand.700");
  const heroTextColor = useColorModeValue("brand.600", "brand.300");
  const sectionHeadingColor = useColorModeValue("brand.800", "brand.100");
  const subtleTextColor = useColorModeValue("brand.500", "brand.400");
  const sectionTextColor = useColorModeValue("brand.600", "brand.300");
  const sectionBg = useColorModeValue("brand.50", "brand.900");
  const footerBorderColor = useColorModeValue("brand.200", "brand.700");
  const footerLinkColor = useColorModeValue("brand.600", "brand.300");
  const footerLinkHoverColor = useColorModeValue("accent.600", "accent.400");
  const brandTextColor = useColorModeValue("brand.700", "brand.200");
  const eyebrowBg = useColorModeValue("accent.50", "accent.900");
  const eyebrowFg = useColorModeValue("accent.700", "accent.200");

  const tints = useColorModeValue(
    {
      ese: { bg: "accent.50", fg: "accent.600" },
      plan504: { bg: "brand.100", fg: "brand.700" },
      ell: { bg: "accommodation.ell.bg", fg: "accommodation.ell.text" },
    },
    {
      ese: { bg: "accent.900", fg: "accent.300" },
      plan504: { bg: "brand.700", fg: "brand.200" },
      ell: { bg: "brand.700", fg: "accent.300" },
    }
  );

  const handleTryDemo = () => {
    startDemo();
    navigate("/classrooms/1/seating-charts/1");
  };

  return (
    <Box>
      {/* Hero Section */}
      <Box
        bg={heroBg}
        position="relative"
        overflow="hidden"
        borderBottom="1px solid"
        borderColor={heroBorderColor}
        pt={{ base: 16, md: 24 }}
        pb={{ base: 16, md: 24 }}
      >
        <Container maxW="6xl" position="relative">
          <Stack
            direction={{ base: "column", lg: "row" }}
            spacing={{ base: 10, lg: 16 }}
            align="center"
          >
            <VStack align="start" spacing={6} flex={1} className="lp-fade-in">
              <Box
                px={3}
                py={1}
                borderRadius="full"
                bg={eyebrowBg}
                color={eyebrowFg}
                fontSize="sm"
                fontWeight="semibold"
                letterSpacing="0"
              >
                For K–12 teachers
              </Box>
              <Heading
                as="h1"
                fontSize={{ base: "3xl", md: "4xl" }}
                fontWeight="extrabold"
                lineHeight="1.05"
                letterSpacing="0"
                color={sectionHeadingColor}
              >
                Seating charts in minutes.
              </Heading>
              <Text fontSize="xl" color={heroTextColor} maxW="lg" lineHeight="tall">
                Import a roster, set "keep apart" and "seat together" rules,
                and generate an optimized arrangement.
              </Text>
              <HStack spacing={3} pt={2} flexWrap="wrap">
                <Button
                  size="lg"
                  variant="accent"
                  onClick={handleTryDemo}
                  px={8}
                >
                  Try the demo
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => navigate("/signup")}
                >
                  Sign up
                </Button>
                <Button
                  size="lg"
                  variant="ghost"
                  onClick={() => navigate("/login")}
                >
                  Log in
                </Button>
              </HStack>
            </VStack>

            <Box flex={1} display="flex" justifyContent="center" className="lp-fade-in">
              <HeroPreview />
            </Box>
          </Stack>
        </Container>
      </Box>

      {/* Features Section */}
      <Box py={{ base: 16, md: 24 }}>
        <Container maxW="6xl">
          <VStack spacing={4} mb={14} textAlign="center">
            <Heading size="2xl" color={sectionHeadingColor}>
              Features
            </Heading>
            <Text fontSize="lg" color={sectionTextColor} maxW="2xl" lineHeight="tall">
              A solver, accommodation flags, and a flexible layout editor —
              built around how teachers actually arrange a room.
            </Text>
          </VStack>

          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
            <Feature
              icon={TimeIcon}
              title="Constraint solver"
              description="Simulated annealing places students against keep-apart, seat-together, and accommodation rules."
              tintBg={tints.ese.bg}
              tintFg={tints.ese.fg}
            />
            <Feature
              icon={SettingsIcon}
              title="Accommodations"
              description="ESE, ELL, 504, and EBD flags get priority placement with per-desk rationale."
              tintBg={tints.plan504.bg}
              tintFg={tints.plan504.fg}
            />
            <Feature
              icon={ViewIcon}
              title="Flexible layouts"
              description="Build rows, groups, U-shapes, or any custom arrangement on a grid editor with autosave."
              tintBg={tints.ell.bg}
              tintFg={tints.ell.fg}
            />
          </SimpleGrid>
        </Container>
      </Box>

      {/* How It Works Section */}
      <Box py={{ base: 16, md: 24 }} bg={sectionBg}>
        <Container maxW="6xl">
          <VStack spacing={4} mb={16} textAlign="center">
            <Heading size="2xl" color={sectionHeadingColor}>
              How it works
            </Heading>
            <Text fontSize="lg" color={sectionTextColor} maxW="xl" lineHeight="tall">
              Three steps from roster to printable chart.
            </Text>
          </VStack>

          <Flex
            direction={{ base: "column", md: "row" }}
            justify="center"
            align={{ base: "center", md: "start" }}
            gap={{ base: 12, md: 6 }}
            maxW="4xl"
            mx="auto"
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
              last
            />
          </Flex>

          <VStack mt={16}>
            <Button
              size="lg"
              variant="accent"
              onClick={() => navigate("/signup")}
              px={10}
            >
              Sign up free
            </Button>
            <Text fontSize="sm" color={subtleTextColor}>
              No credit card required.
            </Text>
          </VStack>
        </Container>
      </Box>

      {/* Footer */}
      <Box py={12} borderTop="1px" borderColor={footerBorderColor}>
        <Container maxW="6xl">
          <Flex
            direction={{ base: "column", md: "row" }}
            justify="space-between"
            align={{ base: "start", md: "center" }}
            gap={6}
          >
            <VStack align="start" spacing={1}>
              <Text fontWeight="bold" fontSize="lg" color={brandTextColor}>
                Map My Seat
              </Text>
              <Text fontSize="sm" color={subtleTextColor}>
                Optimized seating charts for K–12 classrooms.
              </Text>
            </VStack>
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
