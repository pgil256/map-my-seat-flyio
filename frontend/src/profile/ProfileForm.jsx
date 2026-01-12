import { useState, useContext } from "react";
import useApi from "../hooks/useApi";
import UserContext from "../auth/UserContext";
import MakeAlert from "../common/MakeAlert";
import {
  Box,
  FormControl,
  FormLabel,
  Input,
  Button,
  Heading,
  Text,
  Flex,
  VStack,
  Card,
  CardBody,
  useColorModeValue,
} from "@chakra-ui/react";

//Profile form
const ProfileForm = () => {
  const { currentUser, setCurrentUser } = useContext(UserContext);
  const { api } = useApi();
  const username = currentUser.username;
  const [formData, setFormData] = useState({
    firstName: currentUser.firstName,
    lastName: currentUser.lastName,
  });
  const [formErrors, setFormErrors] = useState([]);
  const [saveConfirmed, setSaveConfirmed] = useState(false);

  const headingColor = useColorModeValue("brand.800", "brand.100");
  const textColor = useColorModeValue("brand.600", "brand.300");
  const bgColor = useColorModeValue("brand.50", "brand.900");

  async function handleSubmit(e) {
    e.preventDefault();
    let profileData = {
      firstName: formData.firstName,
      lastName: formData.lastName,
    };

    try {
      const updatedUser = await api.saveUserProfile(
        username,
        profileData
      );
      setCurrentUser(updatedUser);
      setFormData((f) => ({ ...f, password: "" }));
      setFormErrors([]);
      setSaveConfirmed(true);
    } catch (err) {
      console.error(err);
      setFormErrors([err.message]);
      setSaveConfirmed(false);
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((f) => ({
      ...f,
      [name]: value,
    }));
    setFormErrors([]);
  };

  return (
    <Flex
      width="100vw"
      minH="70vh"
      alignItems="center"
      justifyContent="center"
      bg={bgColor}
    >
      <Card p={6} mt={20}>
        <CardBody>
          <form id="profile" onSubmit={handleSubmit}>
            <VStack spacing={4} align="stretch">
              <Heading size="lg" color={headingColor}>
                Profile
              </Heading>
              <Text color={textColor}>Username: {username}</Text>

              <FormControl>
                <FormLabel htmlFor="firstName">First Name</FormLabel>
                <Input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                />
              </FormControl>

              <FormControl>
                <FormLabel htmlFor="lastName">Last Name</FormLabel>
                <Input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                />
              </FormControl>

              <Button variant="solid" type="submit">
                Save
              </Button>

              {formErrors.length > 0 && (
                <MakeAlert messages={formErrors} status="error" />
              )}

              {saveConfirmed && (
                <MakeAlert messages={["Profile successfully updated"]} status="success" />
              )}
            </VStack>
          </form>
        </CardBody>
      </Card>
    </Flex>
  );
};

export default ProfileForm;
