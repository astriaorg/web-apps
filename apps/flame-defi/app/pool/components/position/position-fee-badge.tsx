import { useIntl } from "react-intl";

import { Badge, type BadgeProps } from "@repo/ui/components";
import { cn } from "@repo/ui/utils";
import type { Position } from "pool/types";

export const PositionFeeBadge = ({
  position: { fee },
  className,
  ...props
}: {
  position: Position;
} & BadgeProps) => {
  const { formatNumber } = useIntl();

  return (
    <Badge className={cn("flex items-center space-x-2", className)} {...props}>
      {formatNumber(fee / 1000000, {
        style: "percent",
        minimumFractionDigits: 1,
        maximumFractionDigits: 2,
      })}
    </Badge>
  );
};
