import {
  Skeleton,
  Tabs,
  TabsList,
  TabsTrigger,
} from "@repo/ui/shadcn-primitives";
import * as d3 from "d3";
import {
  SummaryCard,
  SummaryCardFigureText,
  SummaryCardLabel,
} from "earn/components/summary-card";
import { usePageContext } from "earn/modules/vault-details/hooks/usePageContext";
import {
  APY_CHART_INTERVALS,
  APYChartInterval,
} from "earn/modules/vault-details/types";
import { useEffect, useRef } from "react";
import { FormattedNumber } from "react-intl";

const CHART_HEIGHT = 52 * 4;

interface DataItem {
  x: number;
  y?: number | null;
}

export const APYChart = () => {
  const {
    selectedAPYChartInterval,
    setSelectedAPYChartInterval,
    query: { isPending, data },
  } = usePageContext();

  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    const dailyAPYs = data?.vaultByAddress.historicalState.dailyApy;

    if (!dailyAPYs) {
      return;
    }

    const svg = d3.select(svgRef.current);

    // Remove any old content.
    svg.selectAll("*").remove();

    const container = svg.node()?.parentElement;
    const width = container?.clientWidth || 0; // Fill chart to container width.
    const height = CHART_HEIGHT;
    const margin = { top: 0, right: 0, bottom: 16, left: 0 };

    svg
      .attr("width", "100%")
      .attr("height", height)
      .attr("viewBox", `0 0 ${width} ${height}`);

    const x = d3
      .scaleBand()
      .domain(dailyAPYs.map((it) => it.x.toString()))
      .range([margin.left, width - margin.right])
      .padding(0.75);

    // Render month names on x-axis.
    const y = d3
      .scaleLinear()
      .domain([0, d3.max(dailyAPYs, (it) => it.y) as number])
      .nice()
      .range([height - margin.bottom, margin.top]);

    const firstOfMonth: DataItem[] = [];
    for (const item of dailyAPYs) {
      const currentMonth = new Date(item.x * 1000).getMonth(); // Convert to milliseconds.
      const previousItem = firstOfMonth[firstOfMonth.length - 1];
      const previousMonth = previousItem
        ? new Date(previousItem.x * 1000).getMonth()
        : -1;

      if (currentMonth !== previousMonth) {
        firstOfMonth.push(item);
      }
    }

    const formatMonthDate = d3.timeFormat("%b"); // Format abbreviated month name.

    svg
      .append("g")
      .attr("transform", `translate(0, ${height - margin.bottom})`)
      .call(
        d3
          .axisBottom(x)
          .tickValues(firstOfMonth.map((it) => it.x.toString()))
          .tickFormat((it) => formatMonthDate(new Date(+it * 1000)))
          .tickPadding(16)
          .tickSize(0),
      );

    // Add bars with transition.
    svg
      .selectAll(".bar")
      .data(dailyAPYs)
      .enter()
      .append("rect")
      .attr("x", (it) => x(it.x.toString())!)
      .attr("y", y(0)) // Start y from 0 to animate to the actual value.
      .attr("width", x.bandwidth())
      .attr("height", 0)
      .attr("fill", "currentColor")
      .transition()
      .duration(1000)
      .attr("y", (it) => y(it.y || 0))
      .attr("height", (it) => height - margin.bottom - y(it.y || 0));
  }, [data]);

  return (
    <SummaryCard isLoading={isPending} className="mt-4">
      <SummaryCardLabel>
        <span>APY</span>
        <span>
          <Tabs
            defaultValue={selectedAPYChartInterval}
            onValueChange={(value) =>
              setSelectedAPYChartInterval(value as APYChartInterval)
            }
          >
            <TabsList>
              {APY_CHART_INTERVALS.map((it) => (
                <TabsTrigger key={it} value={it}>
                  {it}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </span>
      </SummaryCardLabel>
      <SummaryCardFigureText>
        <FormattedNumber
          value={data?.vaultByAddress.state?.apy ?? 0}
          style="percent"
          minimumFractionDigits={2}
        />
      </SummaryCardFigureText>

      <Skeleton
        isLoading={isPending}
        className={`w-full h-${CHART_HEIGHT / 4}`}
      >
        <svg ref={svgRef} className="earn-chart" />
      </Skeleton>
    </SummaryCard>
  );
};
