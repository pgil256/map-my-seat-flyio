import { useState, useContext } from "react";
import useApi from "../hooks/useApi";
import UserContext from "../auth/UserContext";
import { useAppToast } from "../common/ToastContext";
import {
  Box,
  Container,
  FormControl,
  FormLabel,
  Input,
  Button,
  Heading,
  Text,
  VStack,
  HStack,
  Avatar,
  Divider,
  useColorModeValue,
} from "@chakra-ui/react";

const ProfileForm = () => {
  const { currentUser, setCurrentUser } = useContext(UserContext);
  const { api } = useApi();
  const toast = useAppToast();
  const username = currentUser.username;
  const [formData, setFormData] = useState({
    firstName: currentUser.firstName || "",
    lastName: currentUser.lastName || "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const cardBg = useColorModeValue("white", "brand.800");
  const subtleBg = useColorModeValue("brand.50", "brand.700");
  const borderColor = useColorModeValue("brand.200", "brand.700");
  const labelColor = useColorModeValue("brand.500", "brand.400");

  async function handleSubmit(e) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const updatedUser = await api.saveUserProfile(username, {
        firstName: formData.firstName,
        lastName: formData.lastName,
      });
      setCurrentUser(updatedUser);
      toast.success("Profile updated successfully");
    } catch (err) {
      toast.error(err.message || "Failed to update profile");
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((f) => ({ ...f, [name]: value }));
  };

  return (
    <Container maxW="lg" py={{ base: 8, md: 14 }}>
      <VStack spacing={6}>
        <VStack spacing={3}>
          <Avatar
            size="xl"
            name={`${formData.firstName} ${formData.lastName}`}
            bg="accent.500"
            color="white"
            fontSize="2xl"
          />
          <Heading size="lg">
            {formData.firstName} {formData.lastName}
          </Heading>
          <Text color={labelColor} fontSize="sm">@{username}</Text>
        </VStack>

        <Box
          w="full"
          bg={cardBg}
          shadow="sm"
          borderRadius="lg"
          border="1px"
          borderColor={borderColor}
          p={6}
        >
          <Heading size="md" mb={4}>Account Details</Heading>

          <Box bg={subtleBg} borderRadius="md" p={4} mb={5}>
            <HStack justify="space-between">
              <Text fontSize="sm" color={labelColor}>Username</Text>
              <Text fontWeight="medium">{username}</Text>
            </HStack>
            {currentUser.email && (
              <>
                <Divider my={2} />
                <HStack justify="space-between">
                  <Text fontSize="sm" color={labelColor}>Email</Text>
                  <Text fontWeight="medium">{currentUser.email}</Text>
                </HStack>
              </>
            )}
            {currentUser.title && (
              <>
                <Divider my={2} />
                <HStack justify="space-between">
                  <Text fontSize="sm" color={labelColor}>Title</Text>
                  <Text fontWeight="medium">{currentUser.title}</Text>
                </HStack>
              </>
            )}
          </Box>

          <Divider mb={5} />

          <form onSubmit={handleSubmit}>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel fontSize="sm">First Name</FormLabel>
                <Input
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="Enter first name"
                />
              </FormControl>

              <FormControl>
                <FormLabel fontSize="sm">Last Name</FormLabel>
                <Input
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Enter last name"
                />
              </FormControl>

              <Button
                type="submit"
                w="full"
                isLoading={isSubmitting}
                loadingText="Saving..."
              >
                Save Changes
              </Button>
            </VStack>
          </form>
        </Box>
      </VStack>
    </Container>
  );
};

export default ProfileForm;
