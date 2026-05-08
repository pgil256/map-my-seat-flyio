
import React, { useState } from "react";
import { Flex, Box, Heading, Collapse, Center, Stack, SimpleGrid, Text, Button } from "@chakra-ui/react";

const StudentGrid = ({ students }) => {

    const [expandedCard, setExpandedCard] = useState(null);

    const handleCardClick = (student) => {
        if (expandedCard === student.studentId) {
          setExpandedCard(null);
        } else {
          setExpandedCard(student.studentId);
        }
      };

return(
    <SimpleGrid columns={5} spacing={2}>
    {students && Object.values(students).length
      ? Object.values(students).map((student, index) => (
          <React.Fragment key={student.studentId}>
            <Flex py={5} position="relative">
              <Box
                maxW="510px"
                w="full"
                bg="white"
                _dark={{ bg: "brand.800" }}
                boxShadow="md"
                rounded="lg"
                p={5}
                textAlign="center"
              >
                <Heading
                  fontSize={"2xl"}
                  fontFamily={"body"}
                  onClick={() => handleCardClick(student)}

                  style={{ cursor: "pointer" }}
                >
                  {student.name}
                </Heading>
                <Collapse in={expandedCard === student.studentId}>

                    <>
                      <Center>
                        <Stack
                          fontWeight={600}
                          color="brand.500"
                          m={1}
                          w="250px"
                        >
                          <SimpleGrid columns={2}>
                            <Text>Grade: {student.studentId}</Text>
                            <Text>
                              ESE: {student.isESE ? "Yes" : "No"}
                            </Text>
                            <Text>
                              504: {student.has504 ? "Yes" : "No"}
                            </Text>
                            <Text>
                              ELL: {student.isELL ? "Yes" : "No"}
                            </Text>
                            <Text>
                              EBD: {student.isEBD ? "Yes" : "No"}
                            </Text>
                            <Text>Gender: {student.gender}</Text>
                          </SimpleGrid>
                        </Stack>
                      </Center>
                      <Stack mt={8} direction={"row"} spacing={4}>
                        <Button
                          flex={1}
                          fontSize={"sm"}
                          variant="outline"
                          _focus={{
                            bg: "brand.100",
                          }}
                        >
                          Edit Student
                        </Button>
                      </Stack>
                    </>

                </Collapse>
              </Box>
            </Flex>
          </React.Fragment>
        ))
      : null}
  </SimpleGrid>);
};

export default StudentGrid;
