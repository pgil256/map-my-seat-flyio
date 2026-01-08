import {
  IconButton,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  DrawerHeader,
  DrawerBody,
  VStack,
  Button,
  useDisclosure,
  Box,
} from "@chakra-ui/react";
import { HamburgerIcon } from "@chakra-ui/icons";
import { Link as RouterLink } from "react-router-dom";

function MobileNav({ currentUser, logout }) {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleLogout = () => {
    logout();
    onClose();
  };

  const NavLink = ({ to, children }) => (
    <Button
      as={RouterLink}
      to={to}
      variant="ghost"
      w="full"
      justifyContent="flex-start"
      onClick={onClose}
    >
      {children}
    </Button>
  );

  return (
    <Box display={{ base: "block", md: "none" }}>
      <IconButton
        aria-label="Open menu"
        icon={<HamburgerIcon />}
        onClick={onOpen}
        variant="ghost"
        color="white"
        _hover={{ bg: "teal.500" }}
      />

      <Drawer isOpen={isOpen} placement="right" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px">Menu</DrawerHeader>
          <DrawerBody>
            <VStack spacing={2} align="stretch" mt={4}>
              <NavLink to="/">Home</NavLink>

              {currentUser ? (
                <>
                  <NavLink to={`/periods/${currentUser.username}`}>
                    Set Up Classes
                  </NavLink>
                  <NavLink to={`/classrooms/${currentUser.username}`}>
                    Create Classroom
                  </NavLink>
                  <NavLink to={`/profile/${currentUser.username}`}>
                    Profile
                  </NavLink>
                  <Button
                    variant="ghost"
                    w="full"
                    justifyContent="flex-start"
                    onClick={handleLogout}
                    color="red.500"
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <NavLink to="/login">Log In</NavLink>
                  <NavLink to="/signup">Sign Up</NavLink>
                </>
              )}
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  );
}

export default MobileNav;
