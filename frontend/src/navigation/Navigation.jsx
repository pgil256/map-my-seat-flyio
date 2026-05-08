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
} from "@chakra-ui/react";
import { MoonIcon, SunIcon } from "@chakra-ui/icons";

function NavLink({ to, children, onClick }) {
  const color = useColorModeValue("brand.600", "brand.200");
  const hoverBg = useColorModeValue("brand.100", "brand.800");
  const hoverColor = useColorModeValue("brand.900", "white");

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
      color={color}
      _hover={{ bg: hoverBg, color: hoverColor, textDecoration: "none" }}
      transition="background 0.2s"
    >
      {children}
    </ChakraLink>
  );
}

const Navigation = ({ logout }) => {
  const { currentUser } = useContext(UserContext);
  const { colorMode, toggleColorMode } = useColorMode();
  const bgColor = useColorModeValue("white", "brand.900");
  const borderColor = useColorModeValue("brand.200", "brand.800");
  const navTextColor = useColorModeValue("brand.800", "brand.100");
  const iconHoverBg = useColorModeValue("brand.100", "brand.800");

  const loggedInNav = () => (
    <Box bg={bgColor} w="100%" py={3} px={4} color={navTextColor} borderBottom="1px solid" borderColor={borderColor}>
      <Container maxW="container.xl" px={0}>
        <Flex justify="space-between" align="center">
          <HStack spacing={1} display={{ base: "none", md: "flex" }}>
            <ChakraLink
              as={Link}
              to="/"
              fontWeight="bold"
              fontSize="lg"
              mr={4}
              color={navTextColor}
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
              color={navTextColor}
              size="sm"
              _hover={{ bg: iconHoverBg }}
            />
          </HStack>
          <Box display={{ base: "block", md: "none" }} ml="auto">
            <ChakraLink as={Link} to="/" fontSize="lg" fontWeight="bold" color={navTextColor} _hover={{ textDecoration: "none" }}>
              Map My Seat
            </ChakraLink>
          </Box>
          <MobileNav currentUser={currentUser} logout={logout} />
        </Flex>
      </Container>
    </Box>
  );

  const loggedOutNav = () => (
    <Box bg={bgColor} w="100%" py={3} px={4} color={navTextColor} borderBottom="1px solid" borderColor={borderColor}>
      <Container maxW="container.xl" px={0}>
        <Flex justify="space-between" align="center">
          <HStack spacing={1} display={{ base: "none", md: "flex" }}>
            <ChakraLink
              as={Link}
              to="/"
              fontWeight="bold"
              fontSize="lg"
              mr={4}
              color={navTextColor}
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
              color={navTextColor}
              size="sm"
              _hover={{ bg: iconHoverBg }}
            />
          </HStack>
          <Box display={{ base: "block", md: "none" }} ml="auto">
            <ChakraLink as={Link} to="/" fontSize="lg" fontWeight="bold" color={navTextColor} _hover={{ textDecoration: "none" }}>
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
