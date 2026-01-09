import { useState, useContext } from "react";
import useApi from "../hooks/useApi";
import UserContext from "../auth/UserContext";
import {
  Box,
  FormControl,
  FormLabel,
  Input,
  Button,
  Alert,
  AlertIcon,
  Heading,
  Text,
  Flex
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
      setSaveConfirmed("Profile successfully updated");
    } catch (err) {
      console.error(err);
      setFormErrors([err.message]);
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
    Flex
    width={"100vw"}
    height={"70vh"}
    alignContent={"center"}
    justifyContent={"center"}
  >
    <Box padding="5" bg="white" shadow="md" borderRadius="md" mt={20}>
      <form id="profile" onSubmit={handleSubmit}>
        <Heading as="h2" size="lg" marginBottom="5">
          Profile
        </Heading>
        <Text>Username: {username}</Text>

        <FormControl marginBottom="3">
          <FormLabel htmlFor="firstName">First Name</FormLabel>
          <Input
            type="text"
            name="FirstName" 
            value={formData.firstName}
            onChange={handleChange}
          />
        </FormControl>

        <FormControl marginBottom="3">
          <FormLabel htmlFor="lastName">Last Name</FormLabel>
          <Input
            type="text"
            name="LastName"
            value={formData.lastName}
            onChange={handleChange}
          />
        </FormControl>

        <Button colorScheme="teal" type="submit">
          Save
        </Button>

        {formErrors.length ? (
          <MakeAlert status="error" marginTop="4">
            <AlertIcon />
            {formErrors.map((error, index) => (
              <Box key={index} ml="2">
                {error}
              </Box>
            ))}
          </MakeAlert>
        ) : null}

        {saveConfirmed.length ? (
          <Alert status="success" marginTop="4">
            <AlertIcon />
            {saveConfirmed.map((message, index) => (
              <Box key={index} ml="2">
                {message}
              </Box>
            ))}
          </Alert>
        ) : null}
      </form>
    </Box>
    </Flex>
  );
};

export default ProfileForm;
