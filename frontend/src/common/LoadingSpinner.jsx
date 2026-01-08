import { Center, Spinner, Text, VStack } from "@chakra-ui/react";

function LoadingSpinner({ message = "Loading..." }) {
  return (
    <Center h="200px">
      <VStack spacing={4}>
        <Spinner
          thickness="4px"
          speed="0.65s"
          emptyColor="gray.200"
          color="blue.500"
          size="xl"
        />
        <Text color="gray.500">{message}</Text>
      </VStack>
    </Center>
  );
}

export default LoadingSpinner;
