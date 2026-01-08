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
  Stack,
  useColorModeValue,
} from "@chakra-ui/react";

const SignupForm = ({ signup }) => {
  const navigate = useNavigate();
  const [formErrors, setFormErrors] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      width={"100vw"}
      height={"70vh"}
      alignContent={"center"}
      justifyContent={"center"}
      bg={useColorModeValue("gray.50", "gray.800")}
    >
      <Stack spacing={12} mx={"auto"} maxW={"5xl"} maxH={"5xl"} py={4} px={4}>
        <Stack align={"center"}>
          <Heading fontSize={"4xl"}>Sign up for Map my Seat</Heading>
        </Stack>
        <Box
          rounded={"lg"}
          bg={useColorModeValue("white", "gray.700")}
          boxShadow={"lg"}
          p={10}
        >
          <Center>
            <Stack spacing={5}>
              <form onSubmit={handleSubmit}>
                <Box textAlign="center">
                  <Heading>Sign up</Heading>
                </Box>
                <Box style={{ display: "flex", flexDirection: "row" }}>
                  <Box mr={"4"} mt="4" mb="4">
                    <FormControl isInvalid={!!errors.username} mb={3}>
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
                    <FormControl isInvalid={!!errors.password} mb={3}>
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
                    <FormControl isInvalid={!!errors.email} mb={3}>
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
                  </Box>
                  <Box mt="4" mb="4">
                    <FormLabel htmlFor="title">Title:</FormLabel>
                    <Stack direction="row" mb={3}>
                      <Radio
                        name="title"
                        value="Mr."
                        onChange={handleTitleChange}
                        isChecked={formData.title === "Mr."}
                      />
                      <FormLabel htmlFor="Mr">Mr.</FormLabel>
                      <Radio
                        name="title"
                        value="Mrs."
                        onChange={handleTitleChange}
                        isChecked={formData.title === "Mrs."}
                      />
                      <FormLabel htmlFor="Mrs.">Mrs.</FormLabel>
                      <Radio
                        name="title"
                        value="Ms."
                        onChange={handleTitleChange}
                        isChecked={formData.title === "Ms."}
                      />
                      <FormLabel htmlFor="Ms.">Ms.</FormLabel>
                    </Stack>
                    <FormControl isInvalid={!!errors.firstName} mb={3}>
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
                    <FormControl isInvalid={!!errors.lastName} mb={3}>
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
                  </Box>
                </Box>

                <Center>
                  <Button
                    type="submit"
                    colorScheme={"blue"}
                    bg={"blue.400"}
                    rounded={"full"}
                    px={6}
                    isLoading={isSubmitting}
                    loadingText="Signing up..."
                    _hover={{
                      bg: "green.500",
                    }}
                  >
                    Sign up
                  </Button>
                </Center>
                {formErrors.length ? <MakeAlert messages={formErrors} /> : null}
              </form>
            </Stack>
          </Center>
        </Box>
      </Stack>
    </Flex>
  );
};

export default SignupForm;
