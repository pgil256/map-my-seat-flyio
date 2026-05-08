import { VStack, Text, Button, Box, Heading, Circle, useColorModeValue } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";

function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  actionTo,
  onAction
}) {
  const bgColor = useColorModeValue("brand.50", "brand.800");
  const borderColor = useColorModeValue("brand.200", "brand.700");
  const accentBg = useColorModeValue("accent.100", "accent.900");
  const accentFg = useColorModeValue("accent.600", "accent.300");
  const headingColor = useColorModeValue("brand.800", "brand.100");
  const textColor = useColorModeValue("brand.600", "brand.400");

  return (
    <VStack
      spacing={4}
      py={14}
      px={6}
      bg={bgColor}
      borderRadius="xl"
      borderWidth="1px"
      borderColor={borderColor}
      textAlign="center"
    >
      <Circle size="56px" bg={accentBg} color={accentFg}>
        {icon ? (
          <Box fontSize="2xl">{icon}</Box>
        ) : (
          <Box w="10px" h="10px" borderRadius="full" bg={accentFg} />
        )}
      </Circle>
      <Heading as="h3" size="md" color={headingColor}>
        {title}
      </Heading>
      {description && (
        <Text color={textColor} maxW="sm" lineHeight="tall">
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
