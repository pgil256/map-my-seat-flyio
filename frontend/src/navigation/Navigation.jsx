import { useContext } from "react";
import { Link } from "react-router-dom";
import UserContext from "../auth/UserContext";
import {
  Box,
  Flex,
  Container,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink
} from "@chakra-ui/react";

const Navigation = ({ logout }) => {
  const { currentUser } = useContext(UserContext);

  const loggedInNav = () => {
    return (
      <Container maxW="container.xl" px={0}>
        <Box bg="teal.400" w="100%" p={4} color="white">
          <Breadcrumb spacing="8px" separator="|" fontSize="lg">
            {['/', '/periods', '/classrooms', '/profile'].map((path, index) => (
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
      </Container>
    );
  };

  const loggedOutNav = () => {
    return (
      <Container maxW="container.xl" px={0}>
        <Box bg="teal.400" w="100%" p={4} color="white">
          <Flex justifyContent="space-between">
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
          </Flex>
        </Box>
      </Container>
    );
  };

  return <nav>{!currentUser ? loggedOutNav() : loggedInNav()}</nav>;
};

export default Navigation;
