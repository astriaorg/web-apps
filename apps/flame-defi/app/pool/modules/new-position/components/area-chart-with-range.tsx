import React from "react";
import ReactECharts from "echarts-for-react";

export const AreaChartWithRange: React.FC = () => {
  const option = {
    backgroundColor: "#071520", // HSL(203, 45%, 4%) converted to hex
    tooltip: {
      trigger: "axis",
    },
    // We adjust the grid so our chart has some margins and won't clip the axis.
    // The chart itself sits "behind" the dataZoom overlay.
    grid: {
      left: 50,
      right: 30,
      top: 50,
      bottom: 50,
    },
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: [
        120, 132, 101, 134, 90, 230, 210, 180, 222, 150, 210, 300, 250, 400,
      ],
    },
    yAxis: {
      type: "value",
      splitLine: { show: false },
      axisLabel: { show: false },
    },
    series: [
      {
        name: "Example Data",
        type: "line",
        smooth: false,
        showSymbol: false,
        areaStyle: {
          color: "rgba(230, 149, 41, 0.2)",
        },
        lineStyle: {
          color: "rgba(230, 149, 41, 1)",
        },
        itemStyle: {
          color: "rgba(230, 149, 41, 1)",
        },
        data: [
          120, 132, 101, 134, 90, 230, 210, 180, 222, 150, 210, 300, 250, 400,
        ],
      },
    ],
    // This dataZoom configuration creates a draggable range‐selector
    // that covers the entire plotting area. We make it semi‐transparent
    // so that the chart is still visible behind it.
    dataZoom: [
      {
        type: "slider",
        show: true,
        // Fill the full chart area:
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        height: "100%",

        // Default range (from 0% to 100% of x‐axis)
        start: 0,
        end: 100,

        // Give it some transparency so the data is visible underneath
        backgroundColor: "rgba(0, 0, 0, 0.1)",
        fillerColor: "rgba(0, 0, 0, 0.1)",
        borderColor: "transparent",

        // Turn off extra details and shadows to keep it looking clean
        showDetail: false,
        showDataShadow: false,

        // Make the handles smaller (default is 100%)
        handleSize: "30%",

        // Hide the top bar
        moveHandleSize: 0, // Hide the move handle
        moveHandleIcon: "M 0 0 V 100", // Vertical line from top to bottom
        moveHandleStyle: {
          opacity: 0,
        },

        handleStyle: {
          color: "rgba(230, 149, 41, 0.5)",
          borderColor: "rgba(230, 149, 41, 0.5)",
        },
        emphasis: {
          handleStyle: {
            color: "rgba(230, 149, 41, 1)",
            borderColor: "rgba(230, 149, 41, 1)",
          },
        },
      },
    ],
  };

  return (
    <div style={{ width: "100%", margin: "0 auto" }}>
      <ReactECharts
        option={option}
        style={{ width: "100%", height: "200px" }}
      />
    </div>
  );
};
