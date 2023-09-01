import { useContext } from "react";
import UserContext from "../auth/UserContext";
import { useNavigate } from "react-router-dom";

import {
  Box,
  Heading,
  Container,
  Text,
  OrderedList,
  ListItem,
  Button,
  Stack,
  Flex,
} from "@chakra-ui/react";

export default function Home() {
  const { currentUser } = useContext(UserContext);

  const navigate = useNavigate();

  return (
    <Flex
      Flex
      width={"100vw"}
      height={"80vh"}
      alignContent={"center"}
      justifyContent={"center"}
    >
      <>
        <Container maxW={"3xl"}>
          <Stack
            as={Box}
            textAlign={"center"}
            spacing={{ base: 4, md: 7 }}
            py={{ base: 18, md: 34 }}
          >
            <Heading
              fontWeight={600}
              fontSize={{ base: "2xl", sm: "4xl", md: "6xl" }}
              lineHeight={"110%"}
            >
              Seating charts <br />
              <Text as={"span"} color={"green.400"}>
                made easy
              </Text>
            </Heading>
            {currentUser ? (
              <>
                <>
                  <Text fontSize="3xl">
                    Welcome, {currentUser.firstName || currentUser.username}!
                  </Text>
                  <Heading fontSize="lg" textAlign="left">
                    To get started:
                  </Heading>
                </>
                <>
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
                </>
              </>
            ) : (
              <>
                <Text fontSize="3xl">Welcome to Map My Seat</Text>
                <Text fontSize="2xl">
                  Map My Seat takes your class roster and gradebook data to
                  create a seating chart tailored to your specifications.
                </Text>
                <Stack
                  direction={"column"}
                  spacing={3}
                  align={"center"}
                  alignSelf={"center"}
                  position={"relative"}
                >
                  <>
                    <Button
                      colorScheme={"green"}
                      bg={"green.400"}
                      rounded={"full"}
                      px={6}
                      _hover={{
                        bg: "green.500",
                      }}
                      onClick={() => navigate("/signup")}
                    >
                      Get Started
                    </Button>
                    <Button
                      colorScheme="blue"
                      px={4}
                      onClick={() => navigate("/login")}
                    >
                      Log In
                    </Button>
                  </>
                </Stack>
              </>
            )}
          </Stack>
        </Container>
      </>
    </Flex>
  );
}
