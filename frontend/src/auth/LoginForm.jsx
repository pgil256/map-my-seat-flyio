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
  VStack,
  Card,
  CardBody,
  useColorModeValue,
} from "@chakra-ui/react";

import { useNavigate } from "react-router-dom";
import MakeAlert from "../common/MakeAlert";
import useFormValidation, { validators } from "../hooks/useFormValidation";

const LoginForm = ({ login }) => {
  const navigate = useNavigate();
  const [formErrors, setFormErrors] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const headingColor = useColorModeValue("brand.800", "brand.100");
  const bgColor = useColorModeValue("brand.50", "brand.900");

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
      width="100vw"
      height="100vh"
      alignItems="center"
      justifyContent="center"
      bg={bgColor}
    >
      <Box mx="auto" maxW="lg" py={12} px={6}>
        <VStack spacing={6}>
          <Heading size="lg" color={headingColor}>
            Log in to your account
          </Heading>
          <Card p={6}>
            <CardBody>
              <form onSubmit={handleSubmit}>
                <VStack spacing={4}>
                  <Box textAlign="center" w="full">
                    <Heading size="lg" color={headingColor}>
                      Login
                    </Heading>
                  </Box>
                  <FormControl isInvalid={!!errors.username}>
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
                  <FormControl isInvalid={!!errors.password}>
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
                  <Center mt={2} w="full">
                    <Button
                      type="submit"
                      variant="solid"
                      isLoading={isSubmitting}
                      loadingText="Logging in..."
                    >
                      Log in
                    </Button>
                  </Center>
                  {formErrors.length ? <MakeAlert messages={formErrors} /> : null}
                </VStack>
              </form>
            </CardBody>
          </Card>
        </VStack>
      </Box>
    </Flex>
  );
};

export default LoginForm;
