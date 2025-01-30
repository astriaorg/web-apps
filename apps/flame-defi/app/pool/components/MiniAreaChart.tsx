// ChartExample.tsx
import React from "react";
import ReactEChartsCore from "echarts-for-react/lib/core";
import * as echarts from "echarts/core";
import {
  LineChart,
  LineSeriesOption,
  ScatterChart,
  ScatterSeriesOption,
} from "echarts/charts";
import { GridComponent, GridComponentOption } from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";

// Register only the chart types and components we use
echarts.use([LineChart, ScatterChart, GridComponent, CanvasRenderer]);

// Type for ECharts option
type ECOption = echarts.ComposeOption<
  LineSeriesOption | ScatterSeriesOption | GridComponentOption
>;

const MiniAreaChart: React.FC = () => {
  // Sample data (use your real data here)
  const data: number[] = [
    20, 18, 19, 17, 18, 16, 14, 15, 14, 16, 15, 18, 20, 22, 21, 23,
  ];

  // The last data point
  const lastValue = data[data.length - 1];

  const option: ECOption = {
    // Remove all labels, axis lines, ticks, etc.
    xAxis: {
      type: "category",
      data: data.map((_, i) => i.toString()),
      show: false,
    },
    yAxis: {
      type: "value",
      show: false,
      // Add min and max to control the vertical positioning
      min: (value: { min: number; max: number }) =>
        value.min - (value.max - value.min) * 0.2,
      max: (value: { min: number; max: number }) =>
        value.max + (value.max - value.min) * 0.2,
    },
    grid: {
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
    },
    tooltip: {
      show: false, // disable hover tooltip
    },
    series: [
      // Main line
      {
        type: "line",
        data,
        smooth: false,
        showSymbol: false,
        lineStyle: {
          color: "rgba(230, 149, 41, 1)", // green line (adjust as needed)
          width: 2,
        },
        // We'll use a markLine for the dotted baseline
        markLine: {
          symbol: ["none", "none"],
          lineStyle: {
            type: "dotted",
            color: "rgba(230, 149, 41, 1)",
            width: 1,
          },
          silent: true,
          symbolSize: [0, 0],
          label: {
            show: false,
          },
          data: [{ yAxis: lastValue }],
        },
      },
      // Dot (circle) on the last data point
      {
        type: "scatter",
        data: [[data.length - 1, lastValue]],
        symbolSize: 8,
        itemStyle: {
          color: "rgba(230, 149, 41, 1)",
        },
        // No label or additional hover
        emphasis: { disabled: true },
      },
    ],
  };

  return (
    <div>
      <ReactEChartsCore
        echarts={echarts}
        option={option}
        style={{ width: "235px", height: "40px" }}
      />
    </div>
  );
};

export default MiniAreaChart;
