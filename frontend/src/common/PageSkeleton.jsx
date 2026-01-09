import {
  Box,
  Container,
  Skeleton,
  SkeletonText,
  VStack,
  HStack,
  useColorModeValue,
} from "@chakra-ui/react";

/**
 * Page skeleton for lazy-loaded routes
 * Provides visual feedback while components are loading
 */
function PageSkeleton({ variant = "default" }) {
  const bgColor = useColorModeValue("white", "gray.800");

  if (variant === "form") {
    return (
      <Container maxW="container.md" py={8}>
        <Box bg={bgColor} p={6} borderRadius="lg" shadow="sm">
          <Skeleton height="40px" width="200px" mb={6} />
          <VStack spacing={4} align="stretch">
            <Skeleton height="40px" />
            <Skeleton height="40px" />
            <Skeleton height="40px" />
            <HStack spacing={4} mt={4}>
              <Skeleton height="40px" width="100px" />
              <Skeleton height="40px" width="100px" />
            </HStack>
          </VStack>
        </Box>
      </Container>
    );
  }

  if (variant === "grid") {
    return (
      <Container maxW="container.xl" py={8}>
        <Skeleton height="40px" width="250px" mb={6} />
        <HStack spacing={4} flexWrap="wrap">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Box
              key={i}
              bg={bgColor}
              p={4}
              borderRadius="lg"
              shadow="sm"
              width="300px"
            >
              <Skeleton height="20px" width="150px" mb={3} />
              <SkeletonText noOfLines={3} spacing={2} />
            </Box>
          ))}
        </HStack>
      </Container>
    );
  }

  if (variant === "seating") {
    return (
      <Container maxW="container.xl" py={8}>
        <Skeleton height="40px" width="300px" mb={6} />
        <Box bg={bgColor} p={6} borderRadius="lg" shadow="sm">
          <VStack spacing={4}>
            {[1, 2, 3, 4, 5].map((row) => (
              <HStack key={row} spacing={4}>
                {[1, 2, 3, 4, 5, 6].map((col) => (
                  <Skeleton
                    key={`${row}-${col}`}
                    height="60px"
                    width="80px"
                    borderRadius="md"
                  />
                ))}
              </HStack>
            ))}
          </VStack>
        </Box>
      </Container>
    );
  }

  // Default skeleton
  return (
    <Container maxW="container.xl" py={8}>
      <Box bg={bgColor} p={6} borderRadius="lg" shadow="sm">
        <Skeleton height="40px" width="250px" mb={6} />
        <SkeletonText noOfLines={4} spacing={4} mb={6} />
        <HStack spacing={4}>
          <Skeleton height="40px" width="120px" />
          <Skeleton height="40px" width="120px" />
        </HStack>
      </Box>
    </Container>
  );
}

export default PageSkeleton;
