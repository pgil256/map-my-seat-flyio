import { useContext } from "react";
import { Link } from "react-router-dom";
import UserContext from "../auth/UserContext";
import MobileNav from "./MobileNav";
import {
  Box,
  Flex,
  Container,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Link as ChakraLink,
  IconButton,
  useColorMode,
  useColorModeValue,
} from "@chakra-ui/react";
import { MoonIcon, SunIcon } from "@chakra-ui/icons";

const Navigation = ({ logout }) => {
  const { currentUser } = useContext(UserContext);
  const { colorMode, toggleColorMode } = useColorMode();
  const bgColor = useColorModeValue("teal.400", "teal.600");

  const loggedInNav = () => {
    return (
      <Container maxW="container.xl" px={0}>
        <Box bg={bgColor} w="100%" p={4} color="white">
          <Flex justify="space-between" align="center">
            <Box display={{ base: "none", md: "block" }}>
              <Breadcrumb spacing="8px" separator="|" fontSize="lg">
                {['/', '/periods', `/classrooms/${currentUser.username}`, '/profile'].map((path, index) => (
                  <BreadcrumbItem key={path}>
                    <BreadcrumbLink
                      as={Link}
                      to={path}
                      _hover={{ textDecoration: 'underline' }}
                      _active={{ color: "teal.600" }}
                    >
                      {['Home', 'Set Up Classes', 'Create Classroom', 'Profile'][index]}
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                ))}
                <BreadcrumbItem>
                  <BreadcrumbLink as={Link} to="/" onClick={logout}>
                    Logout
                  </BreadcrumbLink>
                </BreadcrumbItem>
              </Breadcrumb>
            </Box>
            <Box display={{ base: "block", md: "none" }} ml="auto">
              <ChakraLink as={Link} to="/" fontSize="lg" fontWeight="bold" _hover={{ textDecoration: 'none' }}>
                Map My Seat
              </ChakraLink>
            </Box>
            <IconButton
              aria-label="Toggle dark mode"
              icon={colorMode === "light" ? <MoonIcon /> : <SunIcon />}
              onClick={toggleColorMode}
              variant="ghost"
              color="white"
              _hover={{ bg: "whiteAlpha.200" }}
              ml={2}
              display={{ base: "none", md: "flex" }}
            />
            <MobileNav currentUser={currentUser} logout={logout} />
          </Flex>
        </Box>
      </Container>
    );
  };

  const loggedOutNav = () => {
    return (
      <Container maxW="container.xl" px={0}>
        <Box bg={bgColor} w="100%" p={4} color="white">
          <Flex justify="space-between" align="center">
            <Box display={{ base: "none", md: "block" }}>
              <Breadcrumb fontWeight="medium" fontSize="lg" spacing="8px" separator="|">
                {['/', '/login', '/signup'].map((path, index) => (
                  <BreadcrumbItem key={path}>
                    <BreadcrumbLink
                      as={Link}
                      to={path}
                      _hover={{ textDecoration: 'underline' }}
                      _active={{ color: "teal.600" }}
                    >
                      {['Home', 'Log In', 'Sign Up'][index]}
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                ))}
              </Breadcrumb>
            </Box>
            <Box display={{ base: "block", md: "none" }} ml="auto">
              <ChakraLink as={Link} to="/" fontSize="lg" fontWeight="bold" _hover={{ textDecoration: 'none' }}>
                Map My Seat
              </ChakraLink>
            </Box>
            <IconButton
              aria-label="Toggle dark mode"
              icon={colorMode === "light" ? <MoonIcon /> : <SunIcon />}
              onClick={toggleColorMode}
              variant="ghost"
              color="white"
              _hover={{ bg: "whiteAlpha.200" }}
              ml={2}
              display={{ base: "none", md: "flex" }}
            />
            <MobileNav currentUser={currentUser} logout={logout} />
          </Flex>
        </Box>
      </Container>
    );
  };

  return <nav>{!currentUser ? loggedOutNav() : loggedInNav()}</nav>;
};

export default Navigation;
