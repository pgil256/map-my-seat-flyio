import { useState, useEffect, useContext } from "react";
import SeatingApi from "../api";
import UserContext from "../auth/UserContext";
import {
  Box,
  Button,
  Card,
  CardBody,
  Heading,
  SimpleGrid,
  Text,
  Badge,
  HStack,
  VStack,
  IconButton,
  useToast,
} from "@chakra-ui/react";
import { CopyIcon, DeleteIcon, ViewIcon } from "@chakra-ui/icons";

function SeatingChartHistory({ classroomId, periodId, onSelectChart }) {
  const { currentUser } = useContext(UserContext);
  const toast = useToast();

  const [charts, setCharts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCharts() {
      try {
        const data = await SeatingApi.getSeatingCharts(
          currentUser.username,
          classroomId
        );
        // Filter by periodId if provided
        const filtered = periodId
          ? data.filter(c => c.periodId === parseInt(periodId))
          : data;
        setCharts(filtered);
      } catch (err) {
        console.error("Failed to fetch charts:", err);
      } finally {
        setLoading(false);
      }
    }
    if (classroomId) fetchCharts();
  }, [currentUser.username, classroomId, periodId]);

  const handleDuplicate = async (chart) => {
    try {
      const newChart = await SeatingApi.duplicateSeatingChart(
        currentUser.username,
        classroomId,
        chart.seatingChartId,
        `Copy of ${chart.label || 'Chart'}`
      );
      setCharts([newChart, ...charts]);
      toast({ title: "Chart duplicated", status: "success" });
    } catch (err) {
      toast({ title: "Failed to duplicate", status: "error" });
    }
  };

  const handleDelete = async (seatingChartId) => {
    if (!window.confirm("Delete this seating chart?")) return;

    try {
      await SeatingApi.deleteSeatingChart(
        currentUser.username,
        classroomId,
        seatingChartId
      );
      setCharts(charts.filter(c => c.seatingChartId !== seatingChartId));
      toast({ title: "Chart deleted", status: "success" });
    } catch (err) {
      toast({ title: "Failed to delete", status: "error" });
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit"
    });
  };

  if (loading) return <Text>Loading charts...</Text>;

  return (
    <Box>
      <Heading size="md" mb={4}>Seating Chart History</Heading>

      {charts.length === 0 ? (
        <Text color="gray.500">No saved charts yet. Generate a chart to get started.</Text>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
          {charts.map(chart => (
            <Card key={chart.seatingChartId} variant="outline">
              <CardBody>
                <VStack align="start" spacing={2}>
                  <HStack justify="space-between" w="full">
                    <Heading size="sm">
                      {chart.label || `Chart ${chart.number}`}
                    </Heading>
                    <Badge colorScheme="gray">
                      Period {chart.number}
                    </Badge>
                  </HStack>

                  <Text fontSize="sm" color="gray.500">
                    {formatDate(chart.createdAt)}
                  </Text>

                  <HStack spacing={2} pt={2}>
                    <Button
                      size="sm"
                      leftIcon={<ViewIcon />}
                      onClick={() => onSelectChart?.(chart)}
                    >
                      View
                    </Button>
                    <IconButton
                      size="sm"
                      icon={<CopyIcon />}
                      onClick={() => handleDuplicate(chart)}
                      aria-label="Duplicate"
                    />
                    <IconButton
                      size="sm"
                      icon={<DeleteIcon />}
                      colorScheme="red"
                      variant="ghost"
                      onClick={() => handleDelete(chart.seatingChartId)}
                      aria-label="Delete"
                    />
                  </HStack>
                </VStack>
              </CardBody>
            </Card>
          ))}
        </SimpleGrid>
      )}
    </Box>
  );
}

export default SeatingChartHistory;
