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
  SimpleGrid,
  VStack,
  Icon,
  useColorModeValue,
} from "@chakra-ui/react";
import { TimeIcon, SettingsIcon, ViewIcon } from "@chakra-ui/icons";

function QuickAction({ icon, title, description, onClick }) {
  const bg = useColorModeValue("white", "brand.800");
  const borderColor = useColorModeValue("brand.200", "brand.700");
  const iconColor = useColorModeValue("accent.600", "accent.400");
  const descColor = useColorModeValue("brand.500", "brand.400");
  return (
    <Box
      bg={bg}
      p={5}
      borderRadius="lg"
      boxShadow="sm"
      border="1px"
      borderColor={borderColor}
      cursor="pointer"
      onClick={onClick}
      _hover={{ boxShadow: "md", borderColor: "accent.300" }}
      transition="box-shadow 0.15s ease, border-color 0.15s ease"
    >
      <VStack spacing={3} align="start">
        <Icon as={icon} boxSize={5} color={iconColor} />
        <Heading size="sm">{title}</Heading>
        <Text fontSize="sm" color={descColor}>{description}</Text>
      </VStack>
    </Box>
  );
}

export default function Home() {
  const { currentUser } = useContext(UserContext);
  const { api } = useApi();
  const navigate = useNavigate();
  const subtleTextColor = useColorModeValue("brand.500", "brand.400");

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
      <Container maxW="6xl" py={{ base: 8, md: 10 }}>
        <WelcomeModal />

        <Box mb={8}>
          <Text color={subtleTextColor} fontSize="sm" fontWeight="medium">
            Teacher workspace
          </Text>
          <Heading fontWeight={700} fontSize={{ base: "2xl", md: "4xl" }} lineHeight="1.2">
            Welcome back, {currentUser.firstName || currentUser.username}
          </Heading>
          <Text fontSize="lg" color={subtleTextColor} maxW="2xl" mt={3}>
            Manage rosters, room layouts, and seating charts from one place.
          </Text>
        </Box>

        {!setupStatus.loading && (
          <Box mb={8}>
            <SetupProgress
              hasPeriods={setupStatus.hasPeriods}
              hasStudents={setupStatus.hasStudents}
              hasClassroom={setupStatus.hasClassroom}
              username={currentUser.username}
            />
          </Box>
        )}

        <Heading size="md" mb={4}>Next actions</Heading>
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={5}>
          <QuickAction
            icon={TimeIcon}
            title="Set Up Classes"
            description="Create class periods and manage your student rosters."
            onClick={() => navigate("/periods")}
          />
          <QuickAction
            icon={SettingsIcon}
            title="Design Classrooms"
            description="Build desk layouts and configure seating preferences."
            onClick={() => navigate(`/classrooms/${currentUser.username}`)}
          />
          <QuickAction
            icon={ViewIcon}
            title="View Profile"
            description="Update your name and account settings."
            onClick={() => navigate("/profile")}
          />
        </SimpleGrid>
      </Container>
    </Box>
  );
}
