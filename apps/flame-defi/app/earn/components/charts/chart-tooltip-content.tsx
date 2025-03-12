import { tooltipVariants } from "@repo/ui/components";
import { cn } from "@repo/ui/utils";
import { FloatDataPoint } from "earn/generated/gql/graphql";
import { TooltipProps } from "recharts";
import type {
  NameType,
  ValueType,
} from "recharts/types/component/DefaultTooltipContent";

interface ChartTooltipContentProps extends TooltipProps<ValueType, NameType> {
  renderTooltipContent: (value: FloatDataPoint) => React.ReactNode;
}
export const ChartTooltipContent = ({
  active,
  payload,
  renderTooltipContent,
}: ChartTooltipContentProps) => {
  if (active && payload && payload.length && !!payload[0]) {
    return (
      <div className={cn(tooltipVariants())}>
        {renderTooltipContent(payload[0].payload)}
      </div>
    );
  }

  return null;
};
