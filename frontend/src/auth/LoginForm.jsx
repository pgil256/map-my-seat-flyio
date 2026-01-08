import { useState } from "react";
import {
  Box,
  Button,
  Input,
  Center,
  Heading,
  Flex,
  FormLabel,
  FormControl,
  FormErrorMessage,
  Stack,
  useColorModeValue,
} from "@chakra-ui/react";

import { useNavigate } from "react-router-dom";
import MakeAlert from "../common/MakeAlert";
import useFormValidation, { validators } from "../hooks/useFormValidation";

const LoginForm = ({ login }) => {
  const navigate = useNavigate();
  const [formErrors, setFormErrors] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validationRules = {
    username: [validators.required("Username is required")],
    password: [validators.required("Password is required")],
  };

  const {
    values: formData,
    errors,
    handleChange,
    handleBlur,
    validateAll,
  } = useFormValidation({ username: "", password: "" }, validationRules);

  async function handleSubmit(evt) {
    evt.preventDefault();
    if (!validateAll()) return;

    setIsSubmitting(true);
    try {
      let res = await login(formData);
      if (res.success) {
        navigate("/");
      } else {
        setFormErrors(res.errors);
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Flex
      width={"100vw"}
      height={"100vh"}
      alignContent={"center"}
      justifyContent={"center"}
      bg={useColorModeValue("gray.50", "gray.800")}
    >
      <Stack spacing={6} mx={"auto"} maxW={"lg"} py={12} px={6}>
        <Stack align={"center"}>
          <Heading fontSize={"4xl"}>Log in to your account</Heading>
        </Stack>
        <Box
          rounded={"lg"}
          bg={useColorModeValue("white", "gray.700")}
          boxShadow={"lg"}
          p={8}
        >
          <Stack spacing={6}>
            <form onSubmit={handleSubmit}>
              <Box textAlign="center">
                <Heading>Login</Heading>
              </Box>
              <FormControl isInvalid={!!errors.username} mb={4}>
                <FormLabel htmlFor="username">Username</FormLabel>
                <Input
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Username"
                />
                <FormErrorMessage>{errors.username}</FormErrorMessage>
              </FormControl>
              <FormControl isInvalid={!!errors.password} mb={4}>
                <FormLabel htmlFor="password">Password</FormLabel>
                <Input
                  id="password"
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  autoComplete="current-password"
                />
                <FormErrorMessage>{errors.password}</FormErrorMessage>
              </FormControl>
              <Center mt={6}>
                <Button
                  type="submit"
                  colorScheme={"blue"}
                  bg={"blue.400"}
                  rounded={"full"}
                  px={6}
                  isLoading={isSubmitting}
                  loadingText="Logging in..."
                  _hover={{
                    bg: "blue.500",
                  }}
                >
                  Log in
                </Button>
              </Center>
              {formErrors.length ? <MakeAlert messages={formErrors} /> : null}
            </form>
          </Stack>
        </Box>
      </Stack>
    </Flex>
  );
};

export default LoginForm;
