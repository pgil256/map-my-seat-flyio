import { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import UserContext from "../auth/UserContext";
import useApi from "../hooks/useApi";
import WelcomeModal from "../common/WelcomeModal";
import SetupProgress from "../common/SetupProgress";
import LandingPage from "./LandingPage";

import {
  Box,
  Heading,
  Container,
  Text,
  Stack,
  SimpleGrid,
  VStack,
  Icon,
  Button,
  useColorModeValue,
} from "@chakra-ui/react";
import { TimeIcon, SettingsIcon, ViewIcon } from "@chakra-ui/icons";

function QuickAction({ icon, title, description, onClick, colorScheme = "blue" }) {
  const bg = useColorModeValue("white", "gray.700");
  return (
    <Box
      bg={bg}
      p={5}
      borderRadius="lg"
      boxShadow="sm"
      border="1px"
      borderColor={useColorModeValue("gray.100", "gray.600")}
      cursor="pointer"
      onClick={onClick}
      _hover={{ boxShadow: "md", transform: "translateY(-2px)" }}
      transition="all 0.2s"
    >
      <VStack spacing={3} align="start">
        <Icon as={icon} boxSize={5} color={`${colorScheme}.500`} />
        <Heading size="sm">{title}</Heading>
        <Text fontSize="sm" color="gray.500">{description}</Text>
      </VStack>
    </Box>
  );
}

export default function Home() {
  const { currentUser } = useContext(UserContext);
  const { api } = useApi();
  const navigate = useNavigate();

  const [setupStatus, setSetupStatus] = useState({
    hasPeriods: false,
    hasStudents: false,
    hasClassroom: false,
    loading: true,
  });

  useEffect(() => {
    async function fetchSetupStatus() {
      if (!currentUser) return;

      try {
        const [periods, classroom] = await Promise.all([
          api.getPeriods(currentUser.username),
          api.getClassroom(currentUser.username).catch(() => null),
        ]);

        const hasPeriods = periods && periods.length > 0;
        const hasStudents = periods && periods.some(p => p.students && p.students.length > 0);
        const hasClassroom = classroom && classroom.seatingConfig;

        setSetupStatus({
          hasPeriods,
          hasStudents,
          hasClassroom,
          loading: false,
        });
      } catch (err) {
        setSetupStatus(prev => ({ ...prev, loading: false }));
      }
    }

    fetchSetupStatus();
  }, [currentUser, api]);

  if (!currentUser) {
    return <LandingPage />;
  }

  return (
    <Box minH="80vh">
      <Container maxW="4xl" py={{ base: 8, md: 14 }}>
        <WelcomeModal />

        <VStack spacing={8} textAlign="center" mb={10}>
          <Heading
            fontWeight={700}
            fontSize={{ base: "2xl", sm: "4xl", md: "5xl" }}
            lineHeight="1.2"
          >
            Welcome back, {currentUser.firstName || currentUser.username}
          </Heading>
          <Text fontSize="lg" color="gray.500" maxW="lg">
            Manage your classes, design classroom layouts, and generate seating charts.
          </Text>
        </VStack>

        {!setupStatus.loading && (
          <Box display="flex" justifyContent="center" mb={10}>
            <SetupProgress
              hasPeriods={setupStatus.hasPeriods}
              hasStudents={setupStatus.hasStudents}
              hasClassroom={setupStatus.hasClassroom}
              username={currentUser.username}
            />
          </Box>
        )}

        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={5}>
          <QuickAction
            icon={TimeIcon}
            title="Set Up Classes"
            description="Create class periods and manage your student rosters."
            onClick={() => navigate("/periods")}
            colorScheme="green"
          />
          <QuickAction
            icon={SettingsIcon}
            title="Design Classrooms"
            description="Build desk layouts and configure seating preferences."
            onClick={() => navigate(`/classrooms/${currentUser.username}`)}
            colorScheme="blue"
          />
          <QuickAction
            icon={ViewIcon}
            title="View Profile"
            description="Update your name and account settings."
            onClick={() => navigate("/profile")}
            colorScheme="purple"
          />
        </SimpleGrid>
      </Container>
    </Box>
  );
}
