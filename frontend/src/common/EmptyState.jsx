import { VStack, Text, Button, Box } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";

function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  actionTo,
  onAction
}) {
  return (
    <VStack
      spacing={4}
      py={12}
      px={6}
      bg="gray.50"
      borderRadius="lg"
      border="2px dashed"
      borderColor="gray.200"
    >
      {icon && (
        <Box color="gray.400" fontSize="4xl">
          {icon}
        </Box>
      )}
      <Text fontSize="lg" fontWeight="semibold" color="gray.600">
        {title}
      </Text>
      {description && (
        <Text color="gray.500" textAlign="center" maxW="sm">
          {description}
        </Text>
      )}
      {actionLabel && (actionTo || onAction) && (
        <Button
          as={actionTo ? RouterLink : undefined}
          to={actionTo}
          onClick={onAction}
          colorScheme="blue"
          size="md"
        >
          {actionLabel}
        </Button>
      )}
    </VStack>
  );
}

export default EmptyState;
