import { useState, useEffect, useContext, useRef, useCallback, useMemo } from "react";
import { useParams } from "react-router-dom";
import UserContext from "../auth/UserContext";
import useApi from "../hooks/useApi";
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { spreadStudents } from "./algorithms";
import { mulberry32, solveSeating, swapAssignment } from "./solver";
import { seatRationale, scoreAssignment } from "./objective";
import { matrixToSeats, findTeacherDesks } from "./seatGrid";
import "./SeatingChart.css";
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
  HStack,
  VStack,
  Text,
  Tooltip,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Flex,
  Stack,
} from "@chakra-ui/react";

// Score summary shown above the seating chart.
function ScoreCard({ score, breakdown }) {
  if (!breakdown) return null;
  const violations = breakdown.hardViolations || 0;
  const satisfactions = breakdown.pairSatisfactions || 0;
  const color = violations > 0 ? "error.500" : "success.600";

  const helpParts = [];
  helpParts.push(
    violations === 0
      ? "No keep-apart violations"
      : `${violations} keep-apart violation${violations > 1 ? "s" : ""}`
  );
  if (satisfactions > 0) {
    helpParts.push(
      `${satisfactions} seat-together rule${satisfactions > 1 ? "s" : ""} met`
    );
  }

  return (
    <Flex
      className="no-print"
      justify="space-between"
      align="center"
      gap={6}
      px={5}
      py={3}
      borderRadius="md"
      bg="white"
      borderWidth="1px"
      borderColor="brand.200"
      _dark={{ bg: "brand.800", borderColor: "brand.700" }}
      maxW="720px"
    >
      <Stat maxW="none">
        <StatLabel fontSize="xs">Arrangement Score</StatLabel>
        <StatNumber color={color}>{Math.round(score)}</StatNumber>
        <StatHelpText fontSize="xs" mb={0}>
          {helpParts.join(" · ")}
        </StatHelpText>
      </Stat>
    </Flex>
  );
}

// Drag handle around the student-name content of a desk.
function DraggableStudent({ id, isDragging, children }) {
  const { attributes, listeners, setNodeRef } = useDraggable({ id: String(id) });
  return (
    <Box
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      cursor="grab"
      opacity={isDragging ? 0.3 : 1}
      w="100%"
      h="100%"
      tabIndex={0}
    >
      {children}
    </Box>
  );
}

// Drop target wrapping the inside of a student-desk cell.
function DroppableSeat({ id, children }) {
  const { setNodeRef, isOver } = useDroppable({ id: String(id) });
  return (
    <Box
      ref={setNodeRef}
      w="100%"
      h="100%"
      bg={isOver ? "accent.200" : "transparent"}
      transition="background-color 0.1s"
    >
      {children}
    </Box>
  );
}

// Component to show accommodation badges for students
function AccommodationIndicators({ student }) {
  const indicators = [];

  if (student.isESE) indicators.push({ label: "ESE", color: "accommodation.ese.text" });
  if (student.has504) indicators.push({ label: "504", color: "accommodation.plan504.text" });
  if (student.isELL) indicators.push({ label: "ELL", color: "accommodation.ell.text" });
  if (student.isEBD) indicators.push({ label: "EBD", color: "accommodation.ebd.text" });

  if (indicators.length === 0) return null;

  return (
    <HStack spacing={0.5} mt={0.5} justify="center" flexWrap="wrap">
      {indicators.map(({ label, color }) => (
        <Box
          key={label}
          bg={color}
          color="white"
          fontSize="6px"
          px={0.5}
          borderRadius="sm"
          lineHeight="1.2"
        >
          {label}
        </Box>
      ))}
    </HStack>
  );
}

const SeatingChart = () => {
  const { classroomId, number: num } = useParams();
  const number = parseInt(num);
  const containerRef = useRef(null);
  const { currentUser } = useContext(UserContext);
  const { api } = useApi();
  const username = currentUser.username;
  const [classroom, setClassroom] = useState({});
  const [students, setStudents] = useState([]);
  const [sortedStudents, setSortedStudents] = useState([]);
  const [constraints, setConstraints] = useState([]);
  const [matrix, setMatrix] = useState(
    [...Array(12).keys()].map(() => [...Array(12).keys()])
  );
  const [solverScore, setSolverScore] = useState(0);
  const [solverBreakdown, setSolverBreakdown] = useState(null);
  const [activeDragId, setActiveDragId] = useState(null);
  // Stack of {assignment, score, breakdown} snapshots, capped at 5.
  const [undoStack, setUndoStack] = useState([]);

  // Context shared between solver result and the per-seat rationale.
  // Recomputed only when the underlying inputs change.
  const seatContext = useMemo(
    () => ({
      classroom,
      constraints,
      seats: matrixToSeats(matrix),
      teacherDesks: findTeacherDesks(matrix),
    }),
    [classroom, constraints, matrix]
  );

  const pushUndo = useCallback((snapshot) => {
    setUndoStack((prev) => [...prev.slice(-4), snapshot]);
  }, []);

  // dnd-kit's PointerSensor with a small activation distance so a click on a
  // desk doesn't accidentally start a drag (lets the Tooltip still trigger).
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const handleDragEnd = (event) => {
    setActiveDragId(null);
    const { active, over } = event;
    if (!over) return;
    const fromIdx = parseInt(active.id, 10);
    const toIdx = parseInt(over.id, 10);
    if (Number.isNaN(fromIdx) || Number.isNaN(toIdx) || fromIdx === toIdx) return;

    pushUndo({
      assignment: sortedStudents,
      score: solverScore,
      breakdown: solverBreakdown,
    });
    const next = swapAssignment(sortedStudents, fromIdx, toIdx);
    const result = scoreAssignment(next, seatContext);
    setSortedStudents(next);
    setSolverScore(result.total);
    setSolverBreakdown(result.breakdown);
  };

  const handleReoptimize = () => {
    if (sortedStudents.length === 0) return;
    pushUndo({
      assignment: sortedStudents,
      score: solverScore,
      breakdown: solverBreakdown,
    });
    const result = solveSeating(students, classroom, constraints, matrix, {
      initialAssignment: sortedStudents,
      ...(classroom.solverSeed ? { rng: mulberry32(classroom.solverSeed) } : {}),
    });
    setSortedStudents(result.assignment);
    setSolverScore(result.score);
    setSolverBreakdown(result.breakdown);
  };

  const handleUndo = () => {
    if (undoStack.length === 0) return;
    const snapshot = undoStack[undoStack.length - 1];
    setUndoStack((prev) => prev.slice(0, -1));
    setSortedStudents(snapshot.assignment);
    setSolverScore(snapshot.score);
    setSolverBreakdown(snapshot.breakdown);
  };

  const handleSpreadButtonClick = () => {
    pushUndo({
      assignment: sortedStudents,
      score: solverScore,
      breakdown: solverBreakdown,
    });
    const updatedSortedStudents = spreadStudents(matrix, sortedStudents);
    // Re-score so the badge reflects the new positions. We deliberately don't
    // re-run the solver here — Spread is a layout choice, not a request to
    // re-optimize. Re-optimize is its own button.
    const result = scoreAssignment(updatedSortedStudents, seatContext);
    setSortedStudents(updatedSortedStudents);
    setSolverScore(result.total);
    setSolverBreakdown(result.breakdown);
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
            height: "40px",
            overflow: "auto"
          };
      }
      return {
        width: "50px",
        height: "40px",
      };
    };

    return (
      <Container
        ref={containerRef}
        className="seating-chart-container"
        maxW="100vw"
        border="1px solid"
        borderColor="brand.200"
        borderRadius="md"
        bg="white"
        _dark={{ bg: "brand.800", borderColor: "brand.700" }}
        m="0"
        p={{ base: 3, md: 5 }}
      >
        <Center mb="4">
          <Heading>Period {number} Seating Chart</Heading>
        </Center>
        <Table colorScheme="brand">
          <Tbody>
            {matrix.map((row, rowIndex) => (
              <Tr key={rowIndex}>
                {row.map((cell, colIndex) => {
                  let content = null;
                  let studentInDesk = null;
                  let rationaleLines = [];
                  const seatIndexHere = cell === "desk" ? studentIndex : -1;

                  if (cell === "desk") {
                    studentInDesk = sortedStudents[studentIndex] || null;
                    if (studentInDesk && studentInDesk.name) {
                      content = studentInDesk.name;
                      rationaleLines = seatRationale(
                        studentIndex,
                        sortedStudents,
                        seatContext
                      );
                    }
                    studentIndex++;
                  } else if (cell === "teacher-desk") {
                    content = `${currentUser.title} ${currentUser.lastName}`;
                  }

                  const fontSize = computeFontSize(content || "");
                  const cellSize = computeCellSize(cell);

                  const tooltipLabel =
                    rationaleLines.length > 0 ? (
                      <VStack align="start" spacing={0.5} py={1}>
                        {rationaleLines.map((line, i) => (
                          <Text key={i} fontSize="xs">
                            {line}
                          </Text>
                        ))}
                      </VStack>
                    ) : null;

                  const innerContent =
                    cell === "desk" ? (
                      <DroppableSeat id={seatIndexHere}>
                        {studentInDesk ? (
                          <DraggableStudent
                            id={seatIndexHere}
                            isDragging={activeDragId === String(seatIndexHere)}
                          >
                            <Box>
                              {content}
                              <AccommodationIndicators student={studentInDesk} />
                            </Box>
                          </DraggableStudent>
                        ) : (
                          <Box w="100%" h="100%" />
                        )}
                      </DroppableSeat>
                    ) : (
                      <Box>{content}</Box>
                    );

                  const cellNode = (
                    <Td
                      key={colIndex}
                      data-seat-index={seatIndexHere >= 0 ? seatIndexHere : undefined}
                      className={`${
                        cell === "desk"
                          ? "desk"
                          : cell === "teacher-desk"
                          ? "teacher-desk"
                          : ""
                      }`}
                      bg={
                        cell === "desk"
                          ? "brand.100"
                          : cell === "teacher-desk"
                          ? "brand.200"
                          : ""
                      }
                      borderWidth="1px"
                      borderColor="brand.200"
                      cursor={cell === "desk" && studentInDesk ? "grab" : tooltipLabel ? "help" : "default"}
                      width={cellSize.width}
                      height={cellSize.height}
                      whiteSpace="nowrap"
                      overflow="visible"
                      textOverflow="ellipsis"
                      fontSize={fontSize}
                      boxSizing="border-box"
                      textAlign="center"
                      verticalAlign="middle"
                      lineHeight="1.2"
                      p={0.5}
                      m={0}
                    >
                      {innerContent}
                    </Td>
                  );

                  return tooltipLabel ? (
                    <Tooltip
                      key={colIndex}
                      hasArrow
                      placement="top"
                      label={tooltipLabel}
                      openDelay={150}
                    >
                      {cellNode}
                    </Tooltip>
                  ) : (
                    cellNode
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

    // containerRef is the seating-chart Container only — the DragOverlay
    // lives outside this subtree (sibling of the outer Container, under
    // DndContext) so an in-flight drag never leaks into the captured PDF.
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


  const getClassroomData = useCallback(async () => {
    try {
      let classroomData = await api.getClassroom(username, classroomId);
      if (classroomData) {
        setClassroom(classroomData);
        // seatingConfig may arrive as a JSON string from the demo / API.
        const config = classroomData.seatingConfig;
        const parsedConfig =
          typeof config === "string" ? JSON.parse(config) : config;
        if (parsedConfig) setMatrix(parsedConfig);
      }
      let periods = await api.getPeriods(username);
      const currentPeriod = periods.find((p) => p.number === number);

      if (currentPeriod && currentPeriod.periodId) {
        const [periodData, constraintData] = await Promise.all([
          api.getPeriod(username, currentPeriod.periodId),
          api.getConstraints(username, currentPeriod.periodId).catch(() => []),
        ]);
        setStudents(periodData.students || []);
        setConstraints(constraintData || []);
      }
    } catch (err) {
      // Error is handled by the API layer
    }
  }, [api, username, classroomId, number]);

  useEffect(() => {
    if (!username || !number) return;
    getClassroomData();
  }, [username, number, getClassroomData]);

  useEffect(() => {
    if (Object.keys(classroom).length === 0 || students.length === 0) return;
    const result = solveSeating(
      students,
      classroom,
      constraints,
      matrix,
      classroom.solverSeed ? { rng: mulberry32(classroom.solverSeed) } : {}
    );
    setSortedStudents(result.assignment);
    setSolverScore(result.score);
    setSolverBreakdown(result.breakdown);
  }, [classroom, students, constraints, matrix]);

  const draggedStudent =
    activeDragId !== null ? sortedStudents[parseInt(activeDragId, 10)] : null;

  return (
    <DndContext
      sensors={sensors}
      onDragStart={({ active }) => setActiveDragId(active.id)}
      onDragCancel={() => setActiveDragId(null)}
      onDragEnd={handleDragEnd}
    >
      <Container maxW="7xl" py={{ base: 5, md: 7 }}>
        <Stack spacing={4}>
          <Flex
            className="no-print"
            justify="space-between"
            align={{ base: "start", lg: "center" }}
            gap={4}
            direction={{ base: "column", lg: "row" }}
          >
            <Box>
              <Heading size="xl">Seating workspace</Heading>
              <Text color="brand.600" mt={1}>
                Period {number} arrangement with drag-to-swap and solver feedback.
              </Text>
            </Box>
            <HStack spacing={2} flexWrap="wrap" justify={{ base: "start", lg: "end" }}>
              <Tooltip label="Re-run the solver from the current arrangement">
                <Button
                  size="sm"
                  variant="accent"
                  onClick={handleReoptimize}
                  isDisabled={sortedStudents.length === 0}
                >
                  Re-optimize
                </Button>
              </Tooltip>
              <Button
                size="sm"
                onClick={handleUndo}
                isDisabled={undoStack.length === 0}
                variant="outline"
              >
                Undo ({undoStack.length})
              </Button>
              <Button size="sm" variant="outline" onClick={handleSpreadButtonClick}>
                Spread
              </Button>
              <Button size="sm" variant="outline" onClick={exportToPDF}>Export PDF</Button>
              <Button size="sm" variant="ghost" onClick={() => window.print()}>
                Print
              </Button>
            </HStack>
          </Flex>

          <ScoreCard score={solverScore} breakdown={solverBreakdown} />

          <Center>
            <Box w="100%">
              {generateTableContent(matrix, sortedStudents, username)}
            </Box>
          </Center>
        </Stack>
      </Container>

      <DragOverlay>
        {draggedStudent ? (
          <Box
            bg="white"
            _dark={{ bg: "brand.800", color: "brand.100" }}
            border="2px solid"
            borderColor="accent.500"
            borderRadius="md"
            shadow="lg"
            px={2}
            py={1}
            fontSize="0.9rem"
            cursor="grabbing"
          >
            {draggedStudent.name}
          </Box>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

export default SeatingChart;
