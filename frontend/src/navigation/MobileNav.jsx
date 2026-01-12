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
  const iconColor = useColorModeValue("brand.600", "brand.200");
  const hoverBg = useColorModeValue("brand.50", "brand.700");
  const drawerBg = useColorModeValue("white", "brand.800");
  const borderColor = useColorModeValue("brand.200", "brand.700");

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
      _hover={{ bg: hoverBg }}
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
        color={iconColor}
        _hover={{ bg: hoverBg }}
      />

      <Drawer isOpen={isOpen} placement="right" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent bg={drawerBg}>
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px" borderColor={borderColor}>
            Menu
          </DrawerHeader>
          <DrawerBody>
            <VStack spacing={2} align="stretch" mt={4}>
              <NavLink to="/">Home</NavLink>

              {currentUser ? (
                <>
                  <NavLink to="/periods">Classes</NavLink>
                  <NavLink to={`/classrooms/${currentUser.username}`}>
                    Classrooms
                  </NavLink>
                  <NavLink to="/profile">Profile</NavLink>
                  <Button
                    variant="ghost"
                    w="full"
                    justifyContent="flex-start"
                    onClick={handleLogout}
                    color="red.500"
                    _hover={{ bg: "red.50" }}
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
              <Divider my={4} borderColor={borderColor} />
              <HStack justify="space-between" px={4}>
                <Text>Dark Mode</Text>
                <IconButton
                  aria-label="Toggle dark mode"
                  icon={colorMode === "light" ? <MoonIcon /> : <SunIcon />}
                  onClick={toggleColorMode}
                  variant="ghost"
                  size="sm"
                  _hover={{ bg: hoverBg }}
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
