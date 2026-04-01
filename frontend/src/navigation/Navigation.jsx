import { useContext } from "react";
import { Link } from "react-router-dom";
import UserContext from "../auth/UserContext";
import MobileNav from "./MobileNav";
import {
  Box,
  Flex,
  Container,
  HStack,
  Link as ChakraLink,
  IconButton,
  useColorMode,
  useColorModeValue,
  Text,
} from "@chakra-ui/react";
import { MoonIcon, SunIcon } from "@chakra-ui/icons";

function NavLink({ to, children, onClick }) {
  return (
    <ChakraLink
      as={Link}
      to={to}
      onClick={onClick}
      px={3}
      py={1}
      rounded="md"
      fontSize="sm"
      fontWeight="medium"
      color="white"
      _hover={{ bg: "whiteAlpha.200", textDecoration: "none" }}
      transition="background 0.2s"
    >
      {children}
    </ChakraLink>
  );
}

const Navigation = ({ logout }) => {
  const { currentUser } = useContext(UserContext);
  const { colorMode, toggleColorMode } = useColorMode();
  const bgColor = useColorModeValue("teal.500", "teal.700");

  const loggedInNav = () => (
    <Box bg={bgColor} w="100%" py={3} px={4} color="white">
      <Container maxW="container.xl" px={0}>
        <Flex justify="space-between" align="center">
          <HStack spacing={1} display={{ base: "none", md: "flex" }}>
            <ChakraLink
              as={Link}
              to="/"
              fontWeight="bold"
              fontSize="lg"
              mr={4}
              _hover={{ textDecoration: "none", opacity: 0.9 }}
            >
              Map My Seat
            </ChakraLink>
            <NavLink to="/periods">Classes</NavLink>
            <NavLink to={`/classrooms/${currentUser.username}`}>Classrooms</NavLink>
            <NavLink to="/profile">Profile</NavLink>
          </HStack>
          <HStack spacing={2} display={{ base: "none", md: "flex" }}>
            <NavLink to="/" onClick={logout}>Log out</NavLink>
            <IconButton
              aria-label="Toggle dark mode"
              icon={colorMode === "light" ? <MoonIcon /> : <SunIcon />}
              onClick={toggleColorMode}
              variant="ghost"
              color="white"
              size="sm"
              _hover={{ bg: "whiteAlpha.200" }}
            />
          </HStack>
          <Box display={{ base: "block", md: "none" }} ml="auto">
            <ChakraLink as={Link} to="/" fontSize="lg" fontWeight="bold" _hover={{ textDecoration: "none" }}>
              Map My Seat
            </ChakraLink>
          </Box>
          <MobileNav currentUser={currentUser} logout={logout} />
        </Flex>
      </Container>
    </Box>
  );

  const loggedOutNav = () => (
    <Box bg={bgColor} w="100%" py={3} px={4} color="white">
      <Container maxW="container.xl" px={0}>
        <Flex justify="space-between" align="center">
          <HStack spacing={1} display={{ base: "none", md: "flex" }}>
            <ChakraLink
              as={Link}
              to="/"
              fontWeight="bold"
              fontSize="lg"
              mr={4}
              _hover={{ textDecoration: "none", opacity: 0.9 }}
            >
              Map My Seat
            </ChakraLink>
            <NavLink to="/login">Log In</NavLink>
            <NavLink to="/signup">Sign Up</NavLink>
          </HStack>
          <HStack display={{ base: "none", md: "flex" }}>
            <IconButton
              aria-label="Toggle dark mode"
              icon={colorMode === "light" ? <MoonIcon /> : <SunIcon />}
              onClick={toggleColorMode}
              variant="ghost"
              color="white"
              size="sm"
              _hover={{ bg: "whiteAlpha.200" }}
            />
          </HStack>
          <Box display={{ base: "block", md: "none" }} ml="auto">
            <ChakraLink as={Link} to="/" fontSize="lg" fontWeight="bold" _hover={{ textDecoration: "none" }}>
              Map My Seat
            </ChakraLink>
          </Box>
          <MobileNav currentUser={currentUser} logout={logout} />
        </Flex>
      </Container>
    </Box>
  );

  return <nav>{!currentUser ? loggedOutNav() : loggedInNav()}</nav>;
};

export default Navigation;
