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
  useColorMode,
  useColorModeValue,
  Box,
  Divider,
  HStack,
  Text,
} from "@chakra-ui/react";
import { HamburgerIcon, MoonIcon, SunIcon } from "@chakra-ui/icons";
import { Link as RouterLink } from "react-router-dom";

function MobileNav({ currentUser, logout }) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { colorMode, toggleColorMode } = useColorMode();
  const hoverBg = useColorModeValue("teal.500", "teal.700");

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
        _hover={{ bg: hoverBg }}
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
                  <NavLink to="/periods">
                    Set Up Classes
                  </NavLink>
                  <NavLink to={`/classrooms/${currentUser.username}`}>
                    Create Classroom
                  </NavLink>
                  <NavLink to="/profile">
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
              <Divider my={4} />
              <HStack justify="space-between" px={4}>
                <Text>Dark Mode</Text>
                <IconButton
                  aria-label="Toggle dark mode"
                  icon={colorMode === "light" ? <MoonIcon /> : <SunIcon />}
                  onClick={toggleColorMode}
                  variant="ghost"
                  size="sm"
                />
              </HStack>
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  );
}

export default MobileNav;
