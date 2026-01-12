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

const Navigation = ({ logout }) => {
  const { currentUser } = useContext(UserContext);
  const { colorMode, toggleColorMode } = useColorMode();
  const bgColor = useColorModeValue("white", "brand.800");
  const borderColor = useColorModeValue("brand.200", "brand.700");
  const textColor = useColorModeValue("brand.600", "brand.200");
  const activeColor = useColorModeValue("brand.800", "brand.100");
  const hoverBg = useColorModeValue("brand.50", "brand.700");

  const NavLink = ({ to, children, onClick }) => (
    <ChakraLink
      as={Link}
      to={to}
      onClick={onClick}
      px={3}
      py={2}
      fontSize="sm"
      fontWeight="medium"
      color={textColor}
      borderRadius="base"
      _hover={{
        bg: hoverBg,
        color: activeColor,
        textDecoration: "none",
      }}
    >
      {children}
    </ChakraLink>
  );

  const loggedInNav = () => {
    return (
      <Box
        bg={bgColor}
        w="100%"
        borderBottom="1px"
        borderColor={borderColor}
        position="sticky"
        top={0}
        zIndex={10}
      >
        <Container maxW="container.xl" py={3}>
          <Flex justify="space-between" align="center">
            <HStack spacing={1} display={{ base: "none", md: "flex" }}>
              <ChakraLink
                as={Link}
                to="/"
                fontWeight="semibold"
                fontSize="md"
                color={activeColor}
                mr={4}
                _hover={{ textDecoration: "none" }}
              >
                Map My Seat
              </ChakraLink>
              <NavLink to="/">Home</NavLink>
              <NavLink to="/periods">Classes</NavLink>
              <NavLink to={`/classrooms/${currentUser.username}`}>Classrooms</NavLink>
              <NavLink to="/profile">Profile</NavLink>
              <NavLink to="/" onClick={logout}>Logout</NavLink>
            </HStack>

            <Box display={{ base: "block", md: "none" }}>
              <ChakraLink
                as={Link}
                to="/"
                fontWeight="semibold"
                color={activeColor}
                _hover={{ textDecoration: 'none' }}
              >
                Map My Seat
              </ChakraLink>
            </Box>

            <HStack spacing={2}>
              <IconButton
                aria-label="Toggle dark mode"
                icon={colorMode === "light" ? <MoonIcon /> : <SunIcon />}
                onClick={toggleColorMode}
                variant="ghost"
                size="sm"
                display={{ base: "none", md: "flex" }}
              />
              <MobileNav currentUser={currentUser} logout={logout} />
            </HStack>
          </Flex>
        </Container>
      </Box>
    );
  };

  const loggedOutNav = () => {
    return (
      <Box
        bg={bgColor}
        w="100%"
        borderBottom="1px"
        borderColor={borderColor}
        position="sticky"
        top={0}
        zIndex={10}
      >
        <Container maxW="container.xl" py={3}>
          <Flex justify="space-between" align="center">
            <HStack spacing={1} display={{ base: "none", md: "flex" }}>
              <ChakraLink
                as={Link}
                to="/"
                fontWeight="semibold"
                fontSize="md"
                color={activeColor}
                mr={4}
                _hover={{ textDecoration: "none" }}
              >
                Map My Seat
              </ChakraLink>
              <NavLink to="/">Home</NavLink>
              <NavLink to="/login">Log In</NavLink>
              <NavLink to="/signup">Sign Up</NavLink>
            </HStack>

            <Box display={{ base: "block", md: "none" }}>
              <ChakraLink
                as={Link}
                to="/"
                fontWeight="semibold"
                color={activeColor}
                _hover={{ textDecoration: 'none' }}
              >
                Map My Seat
              </ChakraLink>
            </Box>

            <HStack spacing={2}>
              <IconButton
                aria-label="Toggle dark mode"
                icon={colorMode === "light" ? <MoonIcon /> : <SunIcon />}
                onClick={toggleColorMode}
                variant="ghost"
                size="sm"
                display={{ base: "none", md: "flex" }}
              />
              <MobileNav currentUser={currentUser} logout={logout} />
            </HStack>
          </Flex>
        </Container>
      </Box>
    );
  };

  return <nav>{!currentUser ? loggedOutNav() : loggedInNav()}</nav>;
};

export default Navigation;
