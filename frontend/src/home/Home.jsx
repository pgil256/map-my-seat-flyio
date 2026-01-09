import { useContext, useState, useEffect } from "react";
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
  OrderedList,
  ListItem,
  Stack,
  Flex,
} from "@chakra-ui/react";

export default function Home() {
  const { currentUser } = useContext(UserContext);
  const { api } = useApi();

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
        console.error("Failed to fetch setup status:", err);
        setSetupStatus(prev => ({ ...prev, loading: false }));
      }
    }

    fetchSetupStatus();
  }, [currentUser, api]);

  // Show landing page for non-logged-in visitors
  if (!currentUser) {
    return <LandingPage />;
  }

  // Show dashboard for logged-in users
  return (
    <Flex
      width="100vw"
      minH="80vh"
      alignContent="center"
      justifyContent="center"
    >
      <Container maxW="3xl">
        <Stack
          as={Box}
          textAlign="center"
          spacing={{ base: 4, md: 7 }}
          py={{ base: 18, md: 34 }}
        >
          <Heading
            fontWeight={600}
            fontSize={{ base: "2xl", sm: "4xl", md: "6xl" }}
            lineHeight="110%"
          >
            Seating charts <br />
            <Text as="span" color="green.400">
              made easy
            </Text>
          </Heading>

          <WelcomeModal />
          <Text fontSize="3xl">
            Welcome, {currentUser.firstName || currentUser.username}!
          </Text>

          {!setupStatus.loading && (
            <Box display="flex" justifyContent="center">
              <SetupProgress
                hasPeriods={setupStatus.hasPeriods}
                hasStudents={setupStatus.hasStudents}
                hasClassroom={setupStatus.hasClassroom}
                username={currentUser.username}
              />
            </Box>
          )}

          <Heading fontSize="lg" textAlign="left">
            To get started:
          </Heading>
          <OrderedList spacing={3} fontSize="lg" textAlign="left">
            <ListItem>
              Enter your class and student in the "Set Up Classes" tab.
            </ListItem>
            <ListItem>
              Set up the classroom configuration and seating
              specifications under the "Create Classroom" tab.
            </ListItem>
            <ListItem>
              Click on any of the "Period" buttons on the "Create
              Classroom" page to render a seating chart for that period.
            </ListItem>
          </OrderedList>
        </Stack>
      </Container>
    </Flex>
  );
}
