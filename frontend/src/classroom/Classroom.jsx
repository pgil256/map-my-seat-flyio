import { useState } from "react";
import { Center, Box, Table, Tbody, Tr, Td, Button } from "@chakra-ui/react";

//Creates the dynamic table for the classroom
//Uses state to apply css classes at various divs in in the table matrix
//Passes data back to classroom form through updateSeatingConfig function, passed down as prop
const Classroom = (props) => {
  const currentSeatingConfig = props.seatingConfig;
  const updateSeatingConfig = props.updateSeatingConfig;

  const [tableMatrix, setTableMatrix] = useState(currentSeatingConfig);
  const [selected, setSelected] = useState("");

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
        <Box mb={2}>
          <Button
            width="200px"
            size="sm"
            onClick={() => setSelected("teacher-desk")}
            colorScheme={selected === "teacher-desk" ? "red" : "gray"}
          >
            Teacher Desk
          </Button>
          <Button
            width="200px"
            size="sm"
            onClick={() => setSelected("desk")}
            colorScheme={selected === "desk" ? "blue" : "gray"}
            ml={4}
          >
            Student Desk
          </Button>
        </Box>
      </Center>
      <Table h="375px" w="925px" colorScheme="teal">
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
                      ? "blue.500"
                      : cell === "teacher-desk"
                      ? "red.500"
                      : ""
                  }
                  borderWidth="1px"
                  borderColor="gray.200"
                  p={2}
                  _hover={{ bg: "green.200" }}
                  cursor="pointer"
                  transition="background-color 0.3s ease"
                  borderRadius="md"
                  boxShadow="md"
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
