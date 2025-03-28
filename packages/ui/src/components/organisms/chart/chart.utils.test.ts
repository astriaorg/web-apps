import { CHART_TICK_INTERVALS } from "./chart.types";
import { getSummarizedData, getTickIntervalData } from "./chart.utils";

describe("getSummarizedData", () => {
  it("should return correct summary for a simple dataset", () => {
    const data = [
      { x: 1, y: 10 },
      { x: 2, y: 20 },
      { x: 3, y: 30 },
    ];
    const result = getSummarizedData(data);
    expect(result).toEqual({
      downsampled: data,
      domain: [10, 20, 30],
      max: 30,
      min: 10,
      range: 20,
      average: 20,
    });
  });

  it("should handle an empty dataset", () => {
    const data: { x: number; y: number }[] = [];
    const result = getSummarizedData(data);
    expect(result).toEqual({
      downsampled: [],
      domain: [],
      max: 0,
      min: 0,
      range: 0,
      average: 0,
    });
  });

  it("should downsample data correctly for a large dataset", () => {
    const data = Array.from({ length: 1000 }, (_, i) => ({ x: i, y: i }));
    const result = getSummarizedData(data);
    expect(result.downsampled.length).toBeLessThanOrEqual(data.length);
    expect(result.max).toBe(999);
    expect(result.min).toBe(0);
    expect(result.range).toBe(999);
    expect(result.average).toBeCloseTo(499.5);
  });

  it("should handle data with very small range", () => {
    const data = [
      { x: 1, y: 0.01 },
      { x: 2, y: 0.02 },
      { x: 3, y: 0.03 },
    ];
    const result = getSummarizedData(data);
    expect(result.downsampled).toEqual(data);
    expect(result.max).toBe(0.03);
    expect(result.min).toBe(0.01);
    expect(result.range).toBeCloseTo(0.02);
    expect(result.average).toBeCloseTo(0.02);
  });
});

describe("getTickIntervalData", () => {
  it("should return an empty array when input data is empty", () => {
    const data: number[] = [];
    for (const interval of CHART_TICK_INTERVALS) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = getTickIntervalData(data, interval, "" as any);
      expect(result).toEqual([]);
    }
  });

  it("should return the same data if every interval is unique", () => {
    const data = [
      { x: new Date("2024-01-01").getTime(), y: 0 },
      { x: new Date("2024-02-01").getTime(), y: 0 },
      { x: new Date("2024-03-01").getTime(), y: 0 },
      { x: new Date("2024-04-01").getTime(), y: 0 },
      { x: new Date("2024-05-01").getTime(), y: 0 },
      { x: new Date("2024-06-01").getTime(), y: 0 },
    ];
    for (const interval of CHART_TICK_INTERVALS) {
      const result = getTickIntervalData(data, interval, "x");
      expect(result).toEqual(data);
    }
  });

  it("1w interval should work correctly", () => {
    const data = [
      { x: new Date("2024-01-01").getTime(), y: 0 },
      { x: new Date("2024-01-03").getTime(), y: 0 }, // Same week.
      { x: new Date("2024-01-08").getTime(), y: 0 }, // + 1 week.
      { x: new Date("2024-01-09").getTime(), y: 0 }, // + 1 week, same week.
      { x: new Date("2024-01-15").getTime(), y: 0 }, // + 2 weeks.
      { x: new Date("2024-02-01").getTime(), y: 0 },
      { x: new Date("2024-03-01").getTime(), y: 0 },
    ];
    const result = getTickIntervalData(data, "1w", "x");
    expect(result).toEqual([
      { x: new Date("2024-01-01").getTime(), y: 0 },
      { x: new Date("2024-01-08").getTime(), y: 0 },
      { x: new Date("2024-01-15").getTime(), y: 0 },
      { x: new Date("2024-02-01").getTime(), y: 0 },
      { x: new Date("2024-03-01").getTime(), y: 0 },
    ]);
  });

  it("1m interval should work correctly", () => {
    const data = [
      { x: new Date("2023-12-01").getTime(), y: 0 },
      { x: new Date("2023-12-31").getTime(), y: 0 }, // Same month.
      { x: new Date("2024-01-01").getTime(), y: 0 }, // + 1 month.
      { x: new Date("2024-01-31").getTime(), y: 0 }, // + 1 month, same month.
      { x: new Date("2024-02-01").getTime(), y: 0 }, // + 2 months.
      { x: new Date("2024-03-01").getTime(), y: 0 },
    ];
    const result = getTickIntervalData(data, "1m", "x");
    expect(result).toEqual([
      { x: new Date("2023-12-01").getTime(), y: 0 },
      { x: new Date("2024-01-01").getTime(), y: 0 },
      { x: new Date("2024-02-01").getTime(), y: 0 },
      { x: new Date("2024-03-01").getTime(), y: 0 },
    ]);
  });
});
