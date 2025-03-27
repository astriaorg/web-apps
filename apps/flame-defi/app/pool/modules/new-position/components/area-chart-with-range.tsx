import React from "react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  ReferenceLine,
} from "recharts";

interface AreaChartWithRangeProps {
  priceRange: number[];
}

export const AreaChartWithRange: React.FC<AreaChartWithRangeProps> = ({
  // TODO: replace this with the actual price range for the pool
  priceRange = [1, 30],
}: AreaChartWithRangeProps) => {
  // Generate sample data for the chart
  const generateData = () => {
    const data = [];
    // Make a more interesting curve with some random variance
    const baseValues = [
      20, 18, 22, 20, 23, 25, 21, 19, 22, 24, 22, 26, 27, 25, 28, 30,
    ];

    for (let i = 0; i < 31; i++) {
      const index = Math.min(
        Math.floor((i / 30) * (baseValues.length - 1)),
        baseValues.length - 2,
      );
      const nextIndex = Math.min(index + 1, baseValues.length - 1);
      const fraction = (i / 30) * (baseValues.length - 1) - index;

      // Interpolate between baseValues with safe access
      const currentValue = baseValues[index] || 20;
      const nextValue = baseValues[nextIndex] || 20;
      const interpolatedValue =
        currentValue + fraction * (nextValue - currentValue);

      // Add a small random variance
      const value = interpolatedValue + (Math.random() * 2 - 1);

      data.push({
        x: i,
        value,
      });
    }
    return data;
  };

  const data = generateData();
  const minValue = priceRange[0];
  const maxValue = priceRange[1];
  const chartMin = 0;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 0, right: 0, left: 15, bottom: 0 }}>
        <defs>
          <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#E69529" stopOpacity={0.4} />
            <stop offset="95%" stopColor="#E69529" stopOpacity={0.1} />
          </linearGradient>
        </defs>

        {/* Adjust XAxis to ensure 0 is visible */}
        <XAxis
          dataKey="x"
          axisLine={false}
          tickLine={false}
          tick={{ fill: "#666", fontSize: 10 }}
          ticks={[0, 10, 20, 30]}
          tickFormatter={(value) => `${value}`}
          domain={[0, 30]}
          allowDataOverflow={true}
          padding={{ left: 0, right: 0 }}
          interval="preserveStartEnd"
        />
        <YAxis hide />

        {/* Add reference lines for the selected price range */}
        <ReferenceLine x={minValue} stroke="#E69529" strokeWidth={1} />
        <ReferenceLine x={maxValue} stroke="#E69529" strokeWidth={1} />

        {/* Create the highlighted area */}
        <Area
          type="monotone"
          dataKey="value"
          stroke="#E69529"
          strokeWidth={2}
          fill="url(#colorValue)"
          activeDot={false}
          isAnimationActive={false}
          baseLine={chartMin}
          connectNulls
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};
