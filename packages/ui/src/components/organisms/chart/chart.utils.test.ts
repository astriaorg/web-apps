import { CHART_TICK_INTERVALS } from "./chart.types";
import { getDownsampledData, getTickIntervalData } from "./chart.utils";

describe("getDownsampledData", () => {
  it("should return an empty array when input data is empty", () => {
    const data: number[] = [];
    const result = getDownsampledData(data, { maximumDataPoints: 10 });
    expect(result).toEqual([]);
  });

  it("should return the same data if the data length is less than or equal to the target length", () => {
    const data = [1, 2, 3, 4, 5];
    const result = getDownsampledData(data, { maximumDataPoints: 5 });
    expect(result).toEqual(data);
  });

  it("should downsample the data to the target length", () => {
    const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const result = getDownsampledData(data, { maximumDataPoints: 5 });
    expect(result.length).toBe(5);
  });

  it("should handle complex objects correctly", () => {
    const data = [{ x: 1 }, { x: 2 }, { x: 3 }, { x: 4 }, { x: 5 }];
    const result = getDownsampledData(data, { maximumDataPoints: 1 });
    expect(result.length).toBe(1);
  });
});

describe("getTickIntervalData", () => {
  it("should return an empty array when input data is empty", () => {
    const data: number[] = [];
    for (const interval of CHART_TICK_INTERVALS) {
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
