import {
  Box,
  Flex,
  Grid,
  GridItem,
  HStack,
  Stack,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import { demoHeroPreview } from "../demo/demoData";

/**
 * Code-rendered hero preview of the seating-chart UI. Lives in the same
 * theme as the rest of the app — no static screenshot to fall out of sync.
 */
export default function HeroPreview() {
  const frameBg = useColorModeValue("white", "brand.800");
  const frameBorder = useColorModeValue("brand.200", "brand.700");
  const headerBg = useColorModeValue("brand.100", "brand.900");
  const dividerColor = useColorModeValue("brand.200", "brand.700");
  const headingColor = useColorModeValue("brand.800", "brand.100");
  const subtleText = useColorModeValue("brand.500", "brand.400");
  const scoreFg = useColorModeValue("success.600", "success.300");
  const deskBg = useColorModeValue("brand.50", "brand.700");
  const deskBorder = useColorModeValue("brand.200", "brand.600");
  const deskText = useColorModeValue("brand.700", "brand.100");
  const teacherBg = useColorModeValue("brand.200", "brand.600");
  const teacherText = useColorModeValue("brand.700", "brand.100");
  const aisleBg = useColorModeValue("transparent", "transparent");

  return (
    <Box
      borderRadius="md"
      overflow="hidden"
      borderWidth="1px"
      borderColor={frameBorder}
      bg={frameBg}
      boxShadow="md"
      maxW="640px"
      w="100%"
    >
      {/* App preview header */}
      <Flex
        align="center"
        justify="space-between"
        px={4}
        py={3}
        bg={headerBg}
        borderBottom="1px solid"
        borderColor={dividerColor}
      >
        <Text fontSize="sm" color={headingColor} fontWeight="semibold">
          {demoHeroPreview.roomLabel}
        </Text>
        <Text fontSize="xs" color={subtleText} fontWeight="medium">
          {demoHeroPreview.periodLabel}
        </Text>
      </Flex>

      {/* Score strip */}
      <HStack
        justify="center"
        spacing={4}
        px={4}
        py={3}
        bg={frameBg}
        borderBottom="1px solid"
        borderColor={dividerColor}
      >
        <Stack spacing={0} align="center">
          <Text fontSize="xs" color={subtleText} fontWeight="semibold" letterSpacing="0" textTransform="uppercase">
            Arrangement Score
          </Text>
          <Text fontSize="2xl" fontWeight="bold" color={scoreFg} lineHeight="1">
            {demoHeroPreview.score}
          </Text>
        </Stack>
        <Box w="1px" h="8" bg={dividerColor} />
        <Stack spacing={0} align="start">
          <Text fontSize="xs" color={subtleText} fontWeight="semibold" letterSpacing="0" textTransform="uppercase">
            Status
          </Text>
          <Text fontSize="sm" color={headingColor}>
            {demoHeroPreview.status}
          </Text>
        </Stack>
      </HStack>

      {/* Mini seating grid */}
      <Box px={5} py={5} bg={frameBg}>
        <Grid templateColumns="repeat(6, 1fr)" gap={1.5}>
          {demoHeroPreview.rows.flatMap((row, ri) =>
            row.map((cell, ci) => {
              const key = `${ri}-${ci}`;
              if (cell.aisle) {
                return (
                  <GridItem
                    key={key}
                    h={{ base: "20px", md: "22px" }}
                    bg={aisleBg}
                  />
                );
              }
              if (cell.teacher) {
                return (
                  <GridItem
                    key={key}
                    h={{ base: "20px", md: "22px" }}
                    bg={teacherBg}
                    color={teacherText}
                    borderRadius="sm"
                    borderWidth="1px"
                    borderColor={dividerColor}
                    fontSize="xs"
                    fontWeight="semibold"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    {cell.label}
                  </GridItem>
                );
              }
              return (
                <GridItem
                  key={key}
                  position="relative"
                  bg={deskBg}
                  borderWidth="1px"
                  borderColor={deskBorder}
                  borderRadius="sm"
                  h={{ base: "32px", md: "38px" }}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  px={1}
                >
                  <Text
                    fontSize={{ base: "xs", md: "sm" }}
                    color={deskText}
                    fontWeight="medium"
                    noOfLines={1}
                  >
                    {cell.displayName}
                  </Text>
                  {cell.flag && <FlagDot label={cell.flag} />}
                </GridItem>
              );
            })
          )}
        </Grid>
      </Box>
    </Box>
  );
}

function FlagDot({ label }) {
  // Theme-aware accommodation tints (mirror the live SeatingChart palette).
  const styles = {
    ESE: { bg: "accommodation.ese.bg", fg: "accommodation.ese.text" },
    "504": { bg: "accommodation.plan504.bg", fg: "accommodation.plan504.text" },
    ELL: { bg: "accommodation.ell.bg", fg: "accommodation.ell.text" },
    EBD: { bg: "accommodation.ebd.bg", fg: "accommodation.ebd.text" },
  }[label] || { bg: "brand.200", fg: "brand.700" };

  return (
    <Box
      position="absolute"
      bottom="-4px"
      right="-4px"
      px={1}
      borderRadius="full"
      bg={styles.bg}
      color={styles.fg}
      fontSize="xs"
      fontWeight="bold"
      lineHeight="1.4"
      letterSpacing="0"
      boxShadow="sm"
    >
      {label}
    </Box>
  );
}
