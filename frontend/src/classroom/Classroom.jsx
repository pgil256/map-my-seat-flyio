import { useState } from "react";
import { Center, Box, Table, Tbody, Tr, Td, Button, HStack, Text, useColorModeValue } from "@chakra-ui/react";

//Creates the dynamic table for the classroom
//Uses state to apply css classes at various divs in in the table matrix
//Passes data back to classroom form through updateSeatingConfig function, passed down as prop
const Classroom = (props) => {
  const currentSeatingConfig = props.seatingConfig;
  const updateSeatingConfig = props.updateSeatingConfig;

  const [tableMatrix, setTableMatrix] = useState(currentSeatingConfig);
  const [selected, setSelected] = useState("");

  // Color mode values for grid cells
  const emptyBg = useColorModeValue("brand.50", "brand.800");
  const deskBg = useColorModeValue("brand.100", "brand.700");
  const deskBorder = useColorModeValue("brand.300", "brand.500");
  const teacherDeskBg = useColorModeValue("brand.200", "brand.600");
  const hoverBg = useColorModeValue("brand.100", "brand.700");
  const borderColor = useColorModeValue("brand.200", "brand.600");
  const textColor = useColorModeValue("brand.600", "brand.300");

  // Calculate desk counts
  const deskCount = tableMatrix.flat().filter(cell => cell === "desk").length;
  const teacherDeskCount = tableMatrix.flat().filter(cell => cell === "teacher-desk").length;

  const handleClick = (rowIndex, colIndex) => {
    const newTableMatrix = [...tableMatrix];
    if (
      newTableMatrix[rowIndex][colIndex] === "teacher-desk" ||
      newTableMatrix[rowIndex][colIndex] === "desk"
    ) {
      newTableMatrix[rowIndex][colIndex] = null;
    } else {
      newTableMatrix[rowIndex][colIndex] = selected;
    }

    setTableMatrix(newTableMatrix);
    updateSeatingConfig(newTableMatrix);
  };

  return (
    <Box>
      <Center>
        <HStack mb={4} spacing={4}>
          <Button
            width="200px"
            size="sm"
            onClick={() => setSelected("teacher-desk")}
            variant={selected === "teacher-desk" ? "solid" : "outline"}
          >
            Teacher Desk
          </Button>
          <Button
            width="200px"
            size="sm"
            onClick={() => setSelected("desk")}
            variant={selected === "desk" ? "solid" : "outline"}
          >
            Student Desk
          </Button>
        </HStack>
      </Center>
      <Center>
        <HStack spacing={4} mb={4} fontSize="sm" color={textColor}>
          <Text>
            Student Desks: <strong>{deskCount}</strong>
          </Text>
          <Text>
            Teacher Desk: <strong>{teacherDeskCount}</strong>
          </Text>
        </HStack>
      </Center>
      <Table h="375px" w="925px">
        <Tbody>
          {tableMatrix.map((row, rowIndex) => (
            <Tr key={rowIndex}>
              {row.map((cell, colIndex) => (
                <Td
                  key={colIndex}
                  className={cell}
                  onClick={() => handleClick(rowIndex, colIndex)}
                  bg={
                    cell === "desk"
                      ? deskBg
                      : cell === "teacher-desk"
                      ? teacherDeskBg
                      : emptyBg
                  }
                  borderWidth="1px"
                  borderColor={cell === "desk" ? deskBorder : borderColor}
                  p={2}
                  _hover={{ bg: hoverBg, boxShadow: "sm" }}
                  cursor="pointer"
                  transition="all 0.15s ease"
                  borderRadius="md"
                ></Td>
              ))}
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
};

export default Classroom;
