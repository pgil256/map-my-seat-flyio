import { useState } from "react";
import {
  Box,
  Button,
  Input,
  Center,
  Heading,
  Flex,
  FormLabel,
  Stack,
  useColorModeValue,
} from "@chakra-ui/react";

import { useNavigate } from "react-router-dom";
import MakeAlert from "../common/MakeAlert";

//Login form; upon submission navigate to homepage
const LoginForm = ({ login }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [formErrors, setFormErrors] = useState([]);

  async function handleSubmit(evt) {
    evt.preventDefault();
    let res = await login(formData);
    if (res.success) {
      navigate("/");
    }
    setFormErrors(res.errors);
  }

  const handleChange = (evt) => {
    const { name, value } = evt.target;
    setFormData((l) => ({ ...l, [name]: value }));
  };

  return (
    <Flex
      Flex
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
              <FormLabel htmlFor="username">Username</FormLabel>
              <Input
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Username"
                required
              />
              <FormLabel htmlFor="password">Password</FormLabel>
              <Input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                autoComplete="current-password"
                required
              />
              <br />
              <br />
              <Center>
                <Button
                  colorScheme={"blue"}
                  display={"center"}
                  bg={"blue.400"}
                  rounded={"full"}
                  px={6}
                  _hover={{
                    bg: "blue.500",
                  }}
                  onClick={handleSubmit}
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
