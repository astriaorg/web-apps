import { Badge, type BadgeProps, InfoTooltip } from "@repo/ui/components";
import { DotIcon } from "@repo/ui/icons";
import { cn } from "@repo/ui/utils";
import type { Position } from "pool/types";

export const PositionRangeBadge = ({
  position: { liquidity },
  className,
  ...props
}: {
  position: Position;
} & BadgeProps) => {
  const isPositionClosed = liquidity === 0n;

  return (
    <>
      {!isPositionClosed ? (
        <Badge className={cn("gap-1", className)} {...props}>
          <DotIcon size={12} className="fill-success" />
          <span>In Range</span>
        </Badge>
      ) : (
        <Badge className={cn("gap-1", className)} {...props}>
          <span>Closed</span>
          <InfoTooltip content="Your position has zero liquidity and is not earning fees." />
        </Badge>
      )}
    </>
  );
};
