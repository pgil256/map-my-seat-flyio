import { useState, useEffect, useContext, useRef } from "react";
import { useParams } from "react-router-dom";
import UserContext from "../auth/UserContext";
import useApi from "../hooks/useApi";
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import "./SeatingChart.css";
import {
  Table,
  Tbody,
  Box,
  Tr,
  Td,
  Heading,
  Center,
  Button,
  HStack,
  Card,
  CardBody,
  Flex,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";

// Component to show accommodation badges for students using theme colors
function AccommodationIndicators({ student }) {
  const indicators = [];

  if (student.isESE) indicators.push({ label: "ESE", bg: "accommodation.ese.bg", color: "accommodation.ese.text" });
  if (student.has504) indicators.push({ label: "504", bg: "accommodation.plan504.bg", color: "accommodation.plan504.text" });
  if (student.isELL) indicators.push({ label: "ELL", bg: "accommodation.ell.bg", color: "accommodation.ell.text" });
  if (student.isEBD) indicators.push({ label: "EBD", bg: "accommodation.ebd.bg", color: "accommodation.ebd.text" });

  if (indicators.length === 0) return null;

  return (
    <HStack spacing={0.5} mt={0.5} justify="center" flexWrap="wrap">
      {indicators.map(({ label, bg, color }) => (
        <Box
          key={label}
          className="accommodation-badge"
          bg={bg}
          color={color}
          fontSize="6px"
          px={1}
          py={0.5}
          borderRadius="full"
          lineHeight="1.2"
          fontWeight="medium"
        >
          {label}
        </Box>
      ))}
    </HStack>
  );
}

const SeatingChart = () => {
  const { number: num } = useParams();
  const number = parseInt(num);
  const containerRef = useRef(null);
  const { currentUser } = useContext(UserContext);
  const { api } = useApi();
  const username = currentUser.username;
  const [classroom, setClassroom] = useState({});
  const [students, setStudents] = useState([]);
  const [sortedStudents, setSortedStudents] = useState([]);
  const [matrix, setMatrix] = useState(
    [...Array(12).keys()].map(() => [...Array(12).keys()])
  );

  // Color mode values
  const emptyBg = useColorModeValue("brand.50", "brand.800");
  const emptyBorder = useColorModeValue("brand.300", "brand.600");
  const deskBg = useColorModeValue("white", "brand.800");
  const deskBorder = useColorModeValue("brand.300", "brand.500");
  const teacherDeskBg = useColorModeValue("brand.200", "brand.600");
  const textColor = useColorModeValue("brand.800", "brand.100");
  const subtitleColor = useColorModeValue("brand.600", "brand.300");

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

    const computeCellSize = (cellType) => {
      switch (cellType) {
        case "desk":
        case "teacher-desk":
          return {
            width: "60px",
            height: "50px",
            overflow: "hidden"
          };
      }
      return {
        width: "60px",
        height: "50px",
      };
    };

    // Get current date for title bar
    const currentDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    return (
      <Box
        ref={containerRef}
        className="seating-chart-container"
        maxW="100%"
        maxH="80vh"
      >
        {/* Title bar */}
        <Flex justify="space-between" align="center" mb={4}>
          <Box>
            <Heading size="lg" color={textColor}>Period {number} Seating Chart</Heading>
            <Text fontSize="sm" color={subtitleColor}>
              {classroom.name || "Classroom"} | Generated: {currentDate}
            </Text>
          </Box>
        </Flex>
        <Table>
          <Tbody>
            {matrix.map((row, rowIndex) => (
              <Tr key={rowIndex}>
                {row.map((cell, colIndex) => {
                  let content = null;
                  let studentInDesk = null;
                  const isDesk = cell === "desk";
                  const isTeacherDesk = cell === "teacher-desk";
                  const isEmpty = !isDesk && !isTeacherDesk;

                  if (isDesk && studentIndex < sortedStudents.length) {
                    studentInDesk = sortedStudents[studentIndex];
                    content = studentInDesk.name;
                    studentIndex++;
                  } else if (isTeacherDesk) {
                    content = `${currentUser.title} ${currentUser.lastName}`;
                  }

                  const cellSize = computeCellSize(cell);

                  return (
                    <Td
                      key={colIndex}
                      className={`${
                        isDesk
                          ? "desk"
                          : isTeacherDesk
                          ? "teacher-desk"
                          : ""
                      }`}
                      bg={
                        isDesk
                          ? deskBg
                          : isTeacherDesk
                          ? teacherDeskBg
                          : emptyBg
                      }
                      borderWidth={isEmpty ? "1px" : "1px"}
                      borderStyle={isEmpty ? "dashed" : "solid"}
                      borderColor={
                        isDesk
                          ? deskBorder
                          : isTeacherDesk
                          ? deskBorder
                          : emptyBorder
                      }
                      width={cellSize.width}
                      height={cellSize.height}
                      whiteSpace="nowrap"
                      overflow="hidden"
                      textOverflow="ellipsis"
                      fontSize="13px"
                      fontWeight="medium"
                      boxSizing="border-box"
                      textAlign="center"
                      verticalAlign="middle"
                      lineHeight="1.2"
                      p={1}
                      m={0}
                      transition="box-shadow 0.15s ease"
                      _hover={isDesk || isTeacherDesk ? { boxShadow: "sm" } : {}}
                    >
                      <Box color={textColor}>
                        {content}
                        {studentInDesk && <AccommodationIndicators student={studentInDesk} />}
                      </Box>
                    </Td>
                  );
                })}
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>
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
      let classroomData = await api.getClassroom(username);
      if (classroomData) {
        setClassroom(classroomData);
        setMatrix(classroomData.seatingConfig);
      } else {
        console.error("Classroom data is undefined.");
      }
      let periods = await api.getPeriods(username);
      const currentPeriod = periods.find((p) => p.number === number);

      if (currentPeriod && currentPeriod.periodId) {
        let studentsData = await api.getPeriod(
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
    <Box maxW="100%" width="100vw" p={4}>
      <Card p={6}>
        <CardBody>
          {/* Action buttons - top right */}
          <Flex justify="flex-end" mb={4} className="no-print">
            <HStack spacing={3}>
              <Button variant="outline" size="sm" onClick={handleSpreadButtonClick}>
                Spread Students
              </Button>
              <Button variant="outline" size="sm" onClick={exportToPDF}>
                Export to PDF
              </Button>
              <Button variant="outline" size="sm" onClick={() => window.print()}>
                Print
              </Button>
            </HStack>
          </Flex>

          <Center>
            <Box>
              {generateTableContent(matrix, sortedStudents, username)}
            </Box>
          </Center>
        </CardBody>
      </Card>
    </Box>
  );
};

export default SeatingChart;
