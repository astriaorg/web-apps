import * as d3 from "d3";
import type { FloatDataPoint, TimeseriesOptions } from "earn/gql/graphql";
import {
  CHART_CACHE_TIME_MILLISECONDS,
  ChartInterval,
} from "earn/modules/vault-details/types";

// Threshold for the maximum number of data points to display.
const MAX_DATA_POINTS = 1000;

/**
 * Downsamples data to a maximum number of data points.
 * Useful for displaying large datasets in charts to avoid performance issues.
 */
const getDownsampledData = <T>(data: T[]) => {
  if (data.length > MAX_DATA_POINTS) {
    const downsampled: T[] = [];
    const interval = Math.ceil(data.length / MAX_DATA_POINTS);

    for (let i = 0; i < data.length; i += interval) {
      downsampled.push(data[i] as T);
    }

    return downsampled;
  }

  return data;
};

const MILLISECONDS_3_DAYS = 1000 * 60 * 60 * 24 * 3;
const MILLISECONDS_1_WEEK = 1000 * 60 * 60 * 24 * 7;

/**
 *  @returns An array of data points representing the first data point of each interval.
 */
export const getDataIntervalArray = <T extends FloatDataPoint>(
  data: T[],
  interval: ChartInterval,
) => {
  const result: T[] = [];

  if (!data.length) {
    return result;
  }

  switch (interval) {
    case "1w": {
      let previousDate = data[0] ? new Date(data[0].x * 1000).getTime() : 0;
      result.push(data[0] as T);

      for (let i = 1; i < data.length; i++) {
        const currentDate = new Date((data[i] as T).x * 1000).getTime();
        if (currentDate >= previousDate + MILLISECONDS_3_DAYS) {
          result.push(data[i] as T);
          previousDate = currentDate;
        }
      }

      break;
    }
    case "1m": {
      let lastDate = data[0] ? new Date(data[0].x * 1000).getTime() : 0;
      result.push(data[0] as T);

      for (let i = 1; i < data.length; i++) {
        const currentDate = new Date((data[i] as T).x * 1000).getTime();
        if (currentDate >= lastDate + MILLISECONDS_1_WEEK) {
          result.push(data[i] as T);
          lastDate = currentDate;
        }
      }

      break;
    }
    // "3m" || "all"
    default: {
      for (const item of data) {
        const currentMonth = new Date(item.x * 1000).getMonth(); // Convert to milliseconds.
        const previousItem = result[result.length - 1];
        const previousMonth = previousItem
          ? new Date(previousItem.x * 1000).getMonth()
          : -1;

        if (currentMonth !== previousMonth) {
          result.push(item);
        }
      }

      break;
    }
  }

  return result;
};

interface GetLineChartParams<T> {
  data: T[];
  interval: ChartInterval;
  height: number;
  svg: SVGSVGElement;
  tooltip: HTMLDivElement;
  setTooltipContent: (value: T | null) => void;
}

export const initializeLineChart = <T extends FloatDataPoint>({
  data,
  interval,
  height,
  tooltip,
  setTooltipContent,
  ...params
}: GetLineChartParams<T>) => {
  const svg = d3.select(params.svg);

  // Remove any old content.
  svg.selectAll("*").remove();

  const container = svg.node()?.parentElement;
  const width = container?.clientWidth || 0; // Fill chart to container width.
  const margin = { top: 24, right: 0, bottom: 16, left: 0 };

  svg
    .attr("width", "100%")
    .attr("height", height)
    .attr("viewBox", `0 0 ${width} ${height}`);

  data = getDownsampledData(data);

  const x = d3
    .scaleBand()
    .domain(data.map((it) => it.x.toString()))
    .range([margin.left, width - margin.right]);

  const y = d3
    .scaleLinear()
    .domain([0, d3.max(data, (it) => it.y) as number])
    .nice()
    .range([height - margin.bottom, margin.top]);

  const chart = d3
    .line<T>()
    .x((it) => (x(it.x.toString()) ?? 0) + x.bandwidth() / 2)
    .y((it) => y(it.y ?? 0))
    .curve(d3.curveMonotoneX);

  const intervals = getDataIntervalArray(data, interval);

  const formatDate = (() => {
    switch (interval) {
      case "1w":
      case "1m": {
        return d3.timeFormat("%d %b");
      }
      default: {
        return d3.timeFormat("%b %y");
      }
    }
  })();

  svg
    .append("g")
    .attr("transform", `translate(0, ${height - margin.bottom})`)
    .call(
      d3
        .axisBottom(x)
        .tickValues(intervals.map((it) => it.x.toString()))
        .tickFormat((it) => formatDate(new Date(+it * 1000)))
        .tickPadding(16)
        .tickSize(0),
    );

  const path = svg
    .append("path")
    .datum(data)
    .attr("fill", "none")
    .attr("stroke", "currentColor")
    .attr("stroke-width", 1.5)
    .attr("d", chart);

  const totalLength = path.node()?.getTotalLength() || 0;

  path
    .attr("stroke-dasharray", `${totalLength} ${totalLength}`)
    .attr("stroke-dashoffset", totalLength)
    .transition()
    .duration(400)
    .ease(d3.easeLinear)
    .attr("stroke-dashoffset", 0);

  // Add a vertical line over current mouse position.
  const line = svg
    .append("line")
    .attr("stroke", "currentColor")
    .attr("stroke-width", 1)
    .attr("stroke-dasharray", 4)
    .attr("stroke-opacity", 0.2)
    .style("display", "none");

  svg
    .on("mousemove", (event) => {
      const [mouseX] = d3.pointer(event);
      const closestData = data.reduce((previous, current) => {
        const previousDistance = Math.hypot(
          mouseX - (x(previous.x.toString()) ?? 0) - x.bandwidth() / 2,
        );
        const currentDistance = Math.hypot(
          mouseX - (x(current.x.toString()) ?? 0) - x.bandwidth() / 2,
        );
        return currentDistance < previousDistance ? current : previous;
      });

      const closestX = (x(closestData.x.toString()) ?? 0) + x.bandwidth() / 2;
      const closestY = y(closestData.y ?? 0);

      setTooltipContent(closestData);
      tooltip.style.display = "block";
      tooltip.style.left = closestX + "px";
      tooltip.style.top = closestY - 64 + "px";
      tooltip.style.transform = "translateX(-50%)";

      line
        .attr("x1", closestX)
        .attr("x2", closestX)
        .attr("y1", 0)
        .attr("y2", height - margin.bottom)
        .style("display", "block");
    })
    .on("mouseleave", () => {
      setTooltipContent(null);
      tooltip.style.display = "none";
      line.style("display", "none");
    });
};

/**
 * @returns The start and end timestamps for the given chart interval.
 */
export const getTimeseriesOptions = (
  chartInterval: ChartInterval,
): TimeseriesOptions => {
  if (chartInterval === "all") {
    return {
      startTimestamp: null,
      endTimestamp: null,
    };
  }

  // Timestamps change every second, so query is never cached.
  // Round down to the nearest 5 minutes to avoid this.
  const roundDownToNearest5Minutes = (timestamp: number) => {
    const secondsIn5Minutes = CHART_CACHE_TIME_MILLISECONDS / 1000;
    return Math.floor(timestamp / secondsIn5Minutes) * secondsIn5Minutes;
  };

  const getTimestampsFromInterval = (interval: ChartInterval) => {
    const now = Date.now();
    const date = new Date();

    switch (interval) {
      case "1w": {
        date.setDate(date.getDate() - 7);
        return {
          startTimestamp: date.getTime(),
          endTimestamp: now,
        };
      }
      case "1m": {
        date.setMonth(date.getMonth() - 1);
        return {
          startTimestamp: date.getTime(),
          endTimestamp: now,
        };
      }
      case "3m": {
        date.setMonth(date.getMonth() - 3);
        return {
          startTimestamp: date.getTime(),
          endTimestamp: now,
        };
      }
      default: {
        throw new Error(`Invalid interval: "${interval}".`);
      }
    }
  };

  const { startTimestamp, endTimestamp } =
    getTimestampsFromInterval(chartInterval);

  return {
    startTimestamp: Math.floor(
      roundDownToNearest5Minutes(startTimestamp / 1000),
    ),
    endTimestamp: Math.floor(roundDownToNearest5Minutes(endTimestamp / 1000)),
  };
};
