import { cn } from "@repo/ui/lib";
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
    const height = 52 * 4;
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

    // Line chart.
    const line = d3
      .line<DataItem>()
      .x((it) => (x(it.x.toString()) ?? 0) + x.bandwidth() / 2)
      .y((it) => y(it.y || 0))
      .curve(d3.curveMonotoneX);

    const path = svg
      .append("path")
      .datum(dailyAPYs)
      .attr("fill", "none")
      .attr("stroke", "currentColor")
      .attr("stroke-width", 1.5)
      .attr("d", line);

    const totalLength = path.node()?.getTotalLength() || 0;

    path
      .attr("stroke-dasharray", `${totalLength} ${totalLength}`)
      .attr("stroke-dashoffset", totalLength)
      .transition()
      .duration(400)
      .ease(d3.easeLinear)
      .attr("stroke-dashoffset", 0);
  }, [data]);

  return (
    <SummaryCard isLoading={isPending}>
      <SummaryCardLabel className="relative">
        <span>APY</span>
        <span className="absolute right-0">
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

      <div className="mt-4" />
      <Skeleton isLoading={isPending} className="w-full">
        <svg ref={svgRef} className={cn(`earn-chart h-52`)} />
      </Skeleton>
    </SummaryCard>
  );
};
