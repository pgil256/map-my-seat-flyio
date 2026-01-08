import { Component } from "react";
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  VStack,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from "@chakra-ui/react";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo });
    // Log error to console in development
    if (import.meta.env.DEV) {
      console.error("ErrorBoundary caught an error:", error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      return (
        <Container maxW="container.md" py={10}>
          <VStack spacing={6}>
            <Alert
              status="error"
              variant="subtle"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              textAlign="center"
              borderRadius="md"
              py={6}
            >
              <AlertIcon boxSize="40px" mr={0} />
              <AlertTitle mt={4} mb={1} fontSize="lg">
                Something went wrong
              </AlertTitle>
              <AlertDescription maxWidth="sm">
                An unexpected error occurred. Please try refreshing the page or
                returning to the home page.
              </AlertDescription>
            </Alert>

            {import.meta.env.DEV && this.state.error && (
              <Box
                p={4}
                bg="gray.100"
                borderRadius="md"
                w="100%"
                overflow="auto"
              >
                <Text fontFamily="mono" fontSize="sm" color="red.600">
                  {this.state.error.toString()}
                </Text>
                {this.state.errorInfo && (
                  <Text
                    fontFamily="mono"
                    fontSize="xs"
                    color="gray.600"
                    mt={2}
                    whiteSpace="pre-wrap"
                  >
                    {this.state.errorInfo.componentStack}
                  </Text>
                )}
              </Box>
            )}

            <Button colorScheme="blue" onClick={this.handleReset}>
              Return to Home
            </Button>
          </VStack>
        </Container>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
