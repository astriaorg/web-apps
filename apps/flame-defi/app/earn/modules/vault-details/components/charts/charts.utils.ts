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

/**
 *  @returns An array of data points representing the first data point of each month.
 */
const getDataFirstOfMonthArray = <T extends FloatDataPoint>(data: T[]) => {
  const firstOfMonthArray: T[] = [];
  for (const item of data) {
    const currentMonth = new Date(item.x * 1000).getMonth(); // Convert to milliseconds.
    const previousItem = firstOfMonthArray[firstOfMonthArray.length - 1];
    const previousMonth = previousItem
      ? new Date(previousItem.x * 1000).getMonth()
      : -1;

    if (currentMonth !== previousMonth) {
      firstOfMonthArray.push(item);
    }
  }

  return firstOfMonthArray;
};

interface GetLineChartParams<T> {
  data: T[];
  height: number;
  svg: SVGSVGElement;
  tooltip: HTMLDivElement;
  onMouseOver: (value: T) => void;
}

export const initializeLineChart = <T extends FloatDataPoint>({
  data,
  height,
  tooltip,
  onMouseOver,
  ...params
}: GetLineChartParams<T>) => {
  const svg = d3.select(params.svg);

  // Remove any old content.
  svg.selectAll("*").remove();

  const container = svg.node()?.parentElement;
  const width = container?.clientWidth || 0; // Fill chart to container width.
  const margin = { top: 0, right: 0, bottom: 16, left: 0 };

  svg
    .attr("width", "100%")
    .attr("height", height)
    .attr("viewBox", `0 0 ${width} ${height}`);

  data = getDownsampledData(data);

  const x = d3
    .scaleBand()
    .domain(data.map((it) => it.x.toString()))
    .range([margin.left, width - margin.right])
    .padding(0.75);
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

  const firstOfMonthArray = getDataFirstOfMonthArray(data);

  const formatMonthDate = d3.timeFormat("%b"); // Format abbreviated month name.

  svg
    .append("g")
    .attr("transform", `translate(0, ${height - margin.bottom})`)
    .call(
      d3
        .axisBottom(x)
        .tickValues(firstOfMonthArray.map((it) => it.x.toString()))
        .tickFormat((it) => formatMonthDate(new Date(+it * 1000)))
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

  // Tooltip on line hover.
  svg
    .selectAll(".line")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", (it) => (x(it.x.toString()) ?? 0) + x.bandwidth() / 2)
    .attr("cy", (it) => y(it.y ?? 0))
    .attr("r", 5)
    .style("fill", "transparent")
    .on("mouseover", (_, it) => {
      onMouseOver(it);
      tooltip.style.display = "block";
    })
    .on("mousemove", (event) => {
      tooltip.style.left = event.pageX + 10 + "px";
      tooltip.style.top = event.pageY - 20 + "px";
    })
    .on("mouseout", () => {
      tooltip.style.display = "none";
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

  const now = Date.now();
  const date = new Date();

  const { startTimestamp, endTimestamp } = (() => {
    switch (chartInterval) {
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
    }
  })();

  return {
    startTimestamp: Math.floor(
      roundDownToNearest5Minutes(startTimestamp / 1000),
    ),
    endTimestamp: Math.floor(roundDownToNearest5Minutes(endTimestamp / 1000)),
  };
};
