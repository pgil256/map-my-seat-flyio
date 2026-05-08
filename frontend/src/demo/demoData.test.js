import { describe, expect, it } from "vitest";
import {
  demoClassroomConfig,
  demoHeroPreview,
  demoPeriods,
  demoSeatingChart,
  demoSeatingChartMatrix,
} from "./demoData";

describe("demoData", () => {
  it("uses one classroom matrix for the stored chart and hero preview", () => {
    const storedChartMatrix = JSON.parse(demoSeatingChart.chartData);

    expect(storedChartMatrix).toEqual(demoSeatingChartMatrix);
    expect(demoHeroPreview.rows).toHaveLength(demoClassroomConfig.length);
    expect(demoHeroPreview.rows[0]).toHaveLength(demoClassroomConfig[0].length);
  });

  it("builds the hero preview from the canonical period 1 student roster", () => {
    const periodOneNames = new Set(demoPeriods[0].students.map((student) => student.name));
    const previewStudentNames = demoHeroPreview.rows
      .flat()
      .filter((cell) => cell.name)
      .map((cell) => cell.name);

    expect(previewStudentNames).toHaveLength(demoPeriods[0].students.length);
    expect(previewStudentNames.every((name) => periodOneNames.has(name))).toBe(true);
    expect(demoHeroPreview.score).toBeGreaterThan(0);
  });
});
