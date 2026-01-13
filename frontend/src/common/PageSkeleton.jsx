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
 * Uses design system brand colors for consistent appearance
 */
function PageSkeleton({ variant = "default" }) {
  const bgColor = useColorModeValue("white", "brand.800");
  const borderColor = useColorModeValue("brand.200", "brand.700");
  const skeletonStartColor = useColorModeValue("brand.100", "brand.700");
  const skeletonEndColor = useColorModeValue("brand.200", "brand.600");

  const skeletonProps = {
    startColor: skeletonStartColor,
    endColor: skeletonEndColor,
  };

  if (variant === "form") {
    return (
      <Container maxW="container.md" py={8}>
        <Box
          bg={bgColor}
          p={6}
          borderRadius="md"
          borderWidth="1px"
          borderColor={borderColor}
        >
          <Skeleton height="40px" width="200px" mb={6} {...skeletonProps} />
          <VStack spacing={4} align="stretch">
            <Skeleton height="40px" {...skeletonProps} />
            <Skeleton height="40px" {...skeletonProps} />
            <Skeleton height="40px" {...skeletonProps} />
            <HStack spacing={4} mt={4}>
              <Skeleton height="40px" width="100px" {...skeletonProps} />
              <Skeleton height="40px" width="100px" {...skeletonProps} />
            </HStack>
          </VStack>
        </Box>
      </Container>
    );
  }

  if (variant === "grid") {
    return (
      <Container maxW="container.xl" py={8}>
        <Skeleton height="40px" width="250px" mb={6} {...skeletonProps} />
        <HStack spacing={4} flexWrap="wrap">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Box
              key={i}
              bg={bgColor}
              p={4}
              borderRadius="md"
              borderWidth="1px"
              borderColor={borderColor}
              width="300px"
            >
              <Skeleton height="20px" width="150px" mb={3} {...skeletonProps} />
              <SkeletonText
                noOfLines={3}
                spacing={2}
                skeletonHeight={3}
                {...skeletonProps}
              />
            </Box>
          ))}
        </HStack>
      </Container>
    );
  }

  if (variant === "seating") {
    return (
      <Container maxW="container.xl" py={8}>
        <Skeleton height="40px" width="300px" mb={6} {...skeletonProps} />
        <Box
          bg={bgColor}
          p={6}
          borderRadius="md"
          borderWidth="1px"
          borderColor={borderColor}
        >
          <VStack spacing={4}>
            {[1, 2, 3, 4, 5].map((row) => (
              <HStack key={row} spacing={4}>
                {[1, 2, 3, 4, 5, 6].map((col) => (
                  <Skeleton
                    key={`${row}-${col}`}
                    height="60px"
                    width="80px"
                    borderRadius="md"
                    {...skeletonProps}
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
      <Box
        bg={bgColor}
        p={6}
        borderRadius="md"
        borderWidth="1px"
        borderColor={borderColor}
      >
        <Skeleton height="40px" width="250px" mb={6} {...skeletonProps} />
        <SkeletonText
          noOfLines={4}
          spacing={4}
          mb={6}
          skeletonHeight={3}
          {...skeletonProps}
        />
        <HStack spacing={4}>
          <Skeleton height="40px" width="120px" {...skeletonProps} />
          <Skeleton height="40px" width="120px" {...skeletonProps} />
        </HStack>
      </Box>
    </Container>
  );
}

export default PageSkeleton;
