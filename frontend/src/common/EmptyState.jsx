import { VStack, Text, Button, Box, Heading, useColorModeValue } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";

function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  actionTo,
  onAction
}) {
  // Design system colors
  const bgColor = useColorModeValue("brand.50", "brand.800");
  const borderColor = useColorModeValue("brand.200", "brand.700");
  const iconColor = useColorModeValue("brand.400", "brand.400");
  const headingColor = useColorModeValue("brand.800", "brand.100");
  const textColor = useColorModeValue("brand.500", "brand.400");

  return (
    <VStack
      spacing={4}
      py={12}
      px={6}
      bg={bgColor}
      borderRadius="lg"
      border="2px dashed"
      borderColor={borderColor}
      textAlign="center"
    >
      {icon && (
        <Box color={iconColor} fontSize="4xl">
          {icon}
        </Box>
      )}
      <Heading as="h3" size="md" color={headingColor}>
        {title}
      </Heading>
      {description && (
        <Text color={textColor} maxW="sm">
          {description}
        </Text>
      )}
      {actionLabel && (actionTo || onAction) && (
        <Button
          as={actionTo ? RouterLink : undefined}
          to={actionTo}
          onClick={onAction}
          variant="solid"
          size="md"
        >
          {actionLabel}
        </Button>
      )}
    </VStack>
  );
}

export default EmptyState;
