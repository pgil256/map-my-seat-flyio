import { useState, useEffect, useContext, useRef } from "react";
import { useParams } from "react-router-dom";
import UserContext from "../auth/UserContext";
import SeatingApi from "../api.js";
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import {
  Table,
  Tbody,
  Box,
  Tr,
  Td,
  Container,
  Heading,
  Center,
  Button,
} from "@chakra-ui/react";

const SeatingChart = () => {
  const { number: num } = useParams();
  const number = parseInt(num);
  const containerRef = useRef(null);
  const { currentUser } = useContext(UserContext);
  const username = currentUser.username;
  const [classroom, setClassroom] = useState({});
  const [students, setStudents] = useState([]);
  const [sortedStudents, setSortedStudents] = useState([]);
  const [matrix, setMatrix] = useState(
    [...Array(12).keys()].map(() => [...Array(12).keys()])
  );

  const sortAndPrioritizeStudents = (students, classroom) => {
    let modifiedStudentsList = [...students];

    // Sorting based on seating preference
    if (classroom.seatAlphabetical) {
      modifiedStudentsList.sort((a, b) => a.name.localeCompare(b.name));
    } else if (classroom.seatRandomize) {
      for (let i = modifiedStudentsList.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [modifiedStudentsList[i], modifiedStudentsList[j]] = [
          modifiedStudentsList[j],
          modifiedStudentsList[i],
        ];
      }
    } else if (classroom.seatHighLow) {
      const lowToHigh = [...modifiedStudentsList].sort(
        ({ grade: a }, { grade: b }) => b - a
      );
      const result = [];
      while (lowToHigh.length) {
        const low = lowToHigh.shift();
        if (low) result.push(low);
        const high = lowToHigh.pop();
        if (high) result.push(high);
      }
      modifiedStudentsList = result;
    } else if (classroom.seatMaleFemale) {
      const maleToFemale = [...modifiedStudentsList].sort(
        ({ gender: a }, { gender: b }) => a.localeCompare(b)
      );
      const result = [];
      while (maleToFemale.length) {
        const male = maleToFemale.shift();
        if (male) result.push(male);
        const female = maleToFemale.pop();
        if (female) result.push(female);
      }
      modifiedStudentsList = result;
    }

    // Prioritize based on classroom settings
    let priorityStudents = [];
    if (classroom.eseIsPriority) {
      priorityStudents = modifiedStudentsList.filter(
        (student) => student.isESE
      );
    } else if (classroom.ellIsPriority) {
      priorityStudents = modifiedStudentsList.filter(
        (student) => student.isELL
      );
    } else if (classroom.fiveZeroFourIsPriority) {
      priorityStudents = modifiedStudentsList.filter(
        (student) => student.has504
      );
    } else if (classroom.ebdIsPriority) {
      priorityStudents = modifiedStudentsList.filter(
        (student) => student.isEBD
      );
    }

    modifiedStudentsList = priorityStudents.concat(
      modifiedStudentsList.filter(
        (student) => !priorityStudents.includes(student)
      )
    );

    return modifiedStudentsList;
  };

  const spreadStudents = (matrix, sortedStudents) => {
    const deskCount = matrix.flat().filter((cell) => cell === "desk").length;
    const emptyDesks = deskCount - sortedStudents.length;

    if (emptyDesks <= 0) {
      return sortedStudents;
    }

    let spacedStudents = [...sortedStudents];
    for (let i = 1; i <= emptyDesks; i++) {
      const position = sortedStudents.length - i;
      spacedStudents.splice(position, 0, { name: "" });
    }
    return spacedStudents;
  };

  const handleSpreadButtonClick = () => {
    const updatedSortedStudents = spreadStudents(matrix, sortedStudents);
    setSortedStudents(updatedSortedStudents);
  };

  const generateTableContent = (matrix, sortedStudents) => {
    let studentIndex = 0;

    const computeFontSize = (content) => {
      if (content.length < 10) return ".9rem";
      if (content.length < 15) return "0.9rem";
      if (content.length < 20) return "0.9rem";
      return "0.5em";
    };

    const computeCellSize = (cellType) => {
      switch (cellType) {
        case "desk":
        case "teacher-desk":
          return {
            width: "50px",
            height: "30px",
            overflow: "auto"
          };
      }
      return {
        width: "50px",
        height: "30px",
      };
    };

    return (
      <Container
      ref={containerRef}
        maxW="100vw"
        maxH="80vh"
        border="2px solid teal"
        m="2"
        p="2"
      >
        <Center mb="4">
          <Heading>Period {number} Seating Chart</Heading>
        </Center>
        <Table colorScheme="teal">
          <Tbody>
            {matrix.map((row, rowIndex) => (
              <Tr key={rowIndex}>
                {row.map((cell, colIndex) => {
                  let content;

                  if (cell === "desk" && studentIndex < sortedStudents.length) {
                    content = sortedStudents[studentIndex].name;
                    studentIndex++;
                  } else if (cell === "teacher-desk") {
                    content = `${currentUser.title} ${currentUser.lastName}`;
                  }

                  const fontSize = computeFontSize(content || "");
                  const cellSize = computeCellSize(cell);

                  return (
                    <Td
                      key={colIndex}
                      className={`${
                        cell === "desk"
                          ? "desk"
                          : cell === "teacher-desk"
                          ? "teacher-desk"
                          : ""
                      }`}
                      bg={
                        cell === "desk"
                          ? "gray.300"
                          : cell === "teacher-desk"
                          ? "gray.400"
                          : ""
                      }
                      borderWidth="1px"
                      borderColor="gray.200"
                      cursor="pointer"
                      width={cellSize.width}
                      height={cellSize.height}
                      whiteSpace="nowrap"
                      overflow="auto"
                      textOverflow="ellipsis"
                      fontSize={fontSize}
                      boxSizing="border-box"
                      textAlign="center"
                      verticalAlign="middle"
                      lineHeight="30px"
                      p={0} 
                      m={0}
                    >
                      {content}
                    </Td>
                  );
                })}
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Container>
    );
  };

  const exportToPDF = async () => {
    if (!containerRef.current) return;

    const canvas = await html2canvas(containerRef.current);

    const offScreenCanvas = document.createElement('canvas');
    const offScreenCtx = offScreenCanvas.getContext('2d');

    offScreenCanvas.width = canvas.height;
    offScreenCanvas.height = canvas.width;

    offScreenCtx.translate(canvas.height, 0);
    offScreenCtx.rotate(Math.PI / 2);
    offScreenCtx.drawImage(canvas, 0, 0);

    const rotatedImgData = offScreenCanvas.toDataURL('image/png');

    const pdf = new jsPDF('p', 'pt', 'a4');

    const pageWidth = 595.28;
    const pageHeight = 841.89;

    // Set the width to the full page width
    let pdfWidth = pageWidth;
    // Adjust the height based on the image's aspect ratio
    let pdfHeight = pageHeight;

    const xOffset = (pageWidth - pdfWidth) / 2;
    const yOffset = (pageHeight - pdfHeight) / 2;

    pdf.addImage(rotatedImgData, 'PNG', xOffset, yOffset, pdfWidth, pdfHeight);

    pdf.save("seating-chart.pdf");
};


  const getClassroomData = async () => {
    try {
      let classroomData = await SeatingApi.getClassroom(username);
      if (classroomData) {
        setClassroom(classroomData);
        setMatrix(classroomData.seatingConfig);
      } else {
        console.error("Classroom data is undefined.");
      }
      let periods = await SeatingApi.getPeriods(username);
      const currentPeriod = periods.find((p) => p.number === number);

      if (currentPeriod && currentPeriod.periodId) {
        let studentsData = await SeatingApi.getPeriod(
          username,
          currentPeriod.periodId
        );
        setStudents(studentsData);
      } else {
        console.error("Period or periodId is undefined");
      }
    } catch (err) {
      console.error(err.message || "An error occurred");
    }
  };

  useEffect(() => {
    if (!username || !number) {
      console.error("Username is not available.");
      return;
    }
    getClassroomData();
  }, [username, number]);

  useEffect(() => {
    if (Object.keys(classroom).length > 0 && students.length > 0) {
      setSortedStudents(sortAndPrioritizeStudents(students, classroom));
    }
  }, [classroom, students]);

  return (
    <>
<Container maxW='100%' width='100vw' p={0}>
  <Center w='100%'>
    <Button m={3} colorScheme={'blue'} onClick={handleSpreadButtonClick}>
      Spread Students
    </Button>
    <Button onClick={exportToPDF}>Export to PDF</Button>
  </Center>

  <Center>
    <Box mr='3' ml='3'>
      {generateTableContent(matrix, sortedStudents, username)}
    </Box>
  </Center>
</Container>
</>
  );
};

export default SeatingChart;
