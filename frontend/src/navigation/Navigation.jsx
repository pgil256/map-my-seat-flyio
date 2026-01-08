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
  Link as ChakraLink
} from "@chakra-ui/react";

const Navigation = ({ logout }) => {
  const { currentUser } = useContext(UserContext);

  const loggedInNav = () => {
    return (
      <Container maxW="container.xl" px={0}>
        <Box bg="teal.400" w="100%" p={4} color="white">
          <Flex justify="space-between" align="center">
            <Box display={{ base: "none", md: "block" }}>
              <Breadcrumb spacing="8px" separator="|" fontSize="lg">
                {['/', `/periods/${currentUser.username}`, `/classrooms/${currentUser.username}`, `/profile/${currentUser.username}`].map((path, index) => (
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
            <MobileNav currentUser={currentUser} logout={logout} />
          </Flex>
        </Box>
      </Container>
    );
  };

  const loggedOutNav = () => {
    return (
      <Container maxW="container.xl" px={0}>
        <Box bg="teal.400" w="100%" p={4} color="white">
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
            <MobileNav currentUser={currentUser} logout={logout} />
          </Flex>
        </Box>
      </Container>
    );
  };

  return <nav>{!currentUser ? loggedOutNav() : loggedInNav()}</nav>;
};

export default Navigation;
