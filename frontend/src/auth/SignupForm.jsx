import { useState } from "react";
import { useNavigate } from "react-router-dom";
import MakeAlert from "../common/MakeAlert";
import useFormValidation, { validators } from "../hooks/useFormValidation";
import {
  Box,
  Button,
  Input,
  Radio,
  Center,
  Heading,
  Flex,
  FormLabel,
  FormControl,
  FormErrorMessage,
  VStack,
  HStack,
  Card,
  CardBody,
  useColorModeValue,
} from "@chakra-ui/react";

const SignupForm = ({ signup }) => {
  const navigate = useNavigate();
  const [formErrors, setFormErrors] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const headingColor = useColorModeValue("brand.800", "brand.100");
  const bgColor = useColorModeValue("brand.50", "brand.900");

  const validationRules = {
    username: [
      validators.required("Username is required"),
      validators.minLength(3, "Username must be at least 3 characters"),
      validators.pattern(/^[^.]+$/, "Username cannot contain periods"),
    ],
    password: [
      validators.required("Password is required"),
      validators.minLength(5, "Password must be at least 5 characters"),
    ],
    email: [
      validators.required("Email is required"),
      validators.email("Please enter a valid email"),
    ],
    firstName: [validators.required("First name is required")],
    lastName: [validators.required("Last name is required")],
  };

  const {
    values: formData,
    errors,
    handleChange,
    handleBlur,
    validateAll,
    setFieldValue,
  } = useFormValidation(
    {
      username: "",
      password: "",
      firstName: "",
      lastName: "",
      email: "",
      title: "Mr.",
    },
    validationRules
  );

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validateAll()) return;

    setIsSubmitting(true);
    try {
      let res = await signup(formData);
      if (res.success) {
        navigate("/");
      } else {
        setFormErrors(res.errors);
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleTitleChange = (e) => {
    setFieldValue("title", e.target.value);
  };

  return (
    <Flex
      width="100vw"
      minH="100vh"
      alignItems="center"
      justifyContent="center"
      bg={bgColor}
      py={8}
    >
      <Box mx="auto" maxW="4xl" py={4} px={4}>
        <VStack spacing={6}>
          <Heading size="lg" color={headingColor}>
            Sign up for Map my Seat
          </Heading>
          <Card p={6}>
            <CardBody>
              <form onSubmit={handleSubmit}>
                <VStack spacing={4}>
                  <Box textAlign="center" w="full">
                    <Heading size="lg" color={headingColor}>
                      Sign up
                    </Heading>
                  </Box>
                  <Flex direction={{ base: "column", md: "row" }} gap={6}>
                    <VStack spacing={4} flex="1">
                      <FormControl isInvalid={!!errors.username}>
                        <FormLabel htmlFor="username">Username</FormLabel>
                        <Input
                          id="username"
                          name="username"
                          value={formData.username}
                          onChange={handleChange}
                          onBlur={handleBlur}
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
                        />
                        <FormErrorMessage>{errors.password}</FormErrorMessage>
                      </FormControl>
                      <FormControl isInvalid={!!errors.email}>
                        <FormLabel htmlFor="email">Email</FormLabel>
                        <Input
                          id="email"
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          onBlur={handleBlur}
                        />
                        <FormErrorMessage>{errors.email}</FormErrorMessage>
                      </FormControl>
                    </VStack>
                    <VStack spacing={4} flex="1">
                      <FormControl>
                        <FormLabel htmlFor="title">Title</FormLabel>
                        <HStack spacing={4}>
                          <HStack>
                            <Radio
                              name="title"
                              value="Mr."
                              onChange={handleTitleChange}
                              isChecked={formData.title === "Mr."}
                            />
                            <FormLabel htmlFor="Mr" mb={0}>Mr.</FormLabel>
                          </HStack>
                          <HStack>
                            <Radio
                              name="title"
                              value="Mrs."
                              onChange={handleTitleChange}
                              isChecked={formData.title === "Mrs."}
                            />
                            <FormLabel htmlFor="Mrs." mb={0}>Mrs.</FormLabel>
                          </HStack>
                          <HStack>
                            <Radio
                              name="title"
                              value="Ms."
                              onChange={handleTitleChange}
                              isChecked={formData.title === "Ms."}
                            />
                            <FormLabel htmlFor="Ms." mb={0}>Ms.</FormLabel>
                          </HStack>
                        </HStack>
                      </FormControl>
                      <FormControl isInvalid={!!errors.firstName}>
                        <FormLabel htmlFor="firstName">First name</FormLabel>
                        <Input
                          id="firstName"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleChange}
                          onBlur={handleBlur}
                        />
                        <FormErrorMessage>{errors.firstName}</FormErrorMessage>
                      </FormControl>
                      <FormControl isInvalid={!!errors.lastName}>
                        <FormLabel htmlFor="lastName">Last name</FormLabel>
                        <Input
                          id="lastName"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleChange}
                          onBlur={handleBlur}
                        />
                        <FormErrorMessage>{errors.lastName}</FormErrorMessage>
                      </FormControl>
                    </VStack>
                  </Flex>

                  <Center w="full" mt={2}>
                    <Button
                      type="submit"
                      variant="solid"
                      isLoading={isSubmitting}
                      loadingText="Signing up..."
                    >
                      Sign up
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

export default SignupForm;
