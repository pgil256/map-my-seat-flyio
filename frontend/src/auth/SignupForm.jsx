import { useState } from "react";
import { useNavigate } from "react-router-dom";
import MakeAlert from "../common/MakeAlert";
import {
  Box,
  Button,
  Input,
  Radio,
  Center,
  Heading,
  Flex,
  FormLabel,
  Stack,
  useColorModeValue,
} from "@chakra-ui/react";

//Signup form;
const SignupForm = ({ signup }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    title: "",
    firstName: "",
    lastName: "",
    email: "",
  });
  const [formErrors, setFormErrors] = useState([]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (formData.username.includes(".")) {
      return setFormErrors("Periods may not be included in username");
    }
    let res = await signup(formData);

    //Create null classroom to go along with new user
    if (res.success) {
      navigate("/");
    } else {
      setFormErrors(res.errors);
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((data) => ({ ...data, [name]: value }));
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
          mb
        >
          <Center>
            <Stack spacing={5}>
              <form onSubmit={handleSubmit}>
                <Box textAlign="center">
                  <Heading>Sign up</Heading>
                </Box>
                <Box style={{ display: "flex", flexDirection: "row" }}>
                  <Box mr={"4"} mt="4" mb="4">
                    <FormLabel htmlFor="username">Username</FormLabel>
                    <Input
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                    />
                    <br />
                    <FormLabel htmlFor="password">Password</FormLabel>
                    <Input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                    />
                    <br />
                    <FormLabel>Email</FormLabel>
                    <Input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </Box>
                  <Box mt="4" mb="4">
                    {" "}
                    {/* Added padding to top and bottom */}
                    <FormLabel htmlFor="title">Title:</FormLabel>
                    <Stack direction="row">
                      <Radio
                        type="radio"
                        name="title"
                        value="Mr."
                        onChange={handleChange}
                        checked={formData.title === "Mr."}
                      />
                      <FormLabel htmlFor="Mr">Mr.</FormLabel>
                      <Radio
                        type="radio"
                        name="title"
                        value="Mrs."
                        onChange={handleChange}
                        checked={formData.title === "Mrs."}
                      />
                      <FormLabel htmlFor="Mrs.">Mrs.</FormLabel>
                      <Radio
                        type="radio"
                        name="title"
                        value="Ms."
                        onChange={handleChange}
                        checked={formData.title === "Ms."}
                      />
                      <FormLabel htmlFor="Ms.">Ms.</FormLabel>
                    </Stack>
                    <FormLabel htmlFor="firstName">First name</FormLabel>
                    <Input
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                    />
                    <FormLabel htmlFor="lastName">Last name</FormLabel>
                    <Input
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                    />
                  </Box>
                </Box>

                <Center>
                  <Button
                    onClick={handleSubmit}
                    colorScheme={"blue"}
                    bg={"blue.400"}
                    rounded={"full"}
                    px={6}
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
