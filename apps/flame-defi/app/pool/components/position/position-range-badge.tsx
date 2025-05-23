import Big from "big.js";
import { useMemo } from "react";

import {
  Badge,
  type BadgeProps,
  InfoTooltip,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@repo/ui/components";
import { DotIcon } from "@repo/ui/icons";
import { cn } from "@repo/ui/utils";
import type { Position } from "pool/types";
import { calculateTickToPrice } from "pool/utils";

enum PositionRangeStatus {
  IN_RANGE = "IN_RANGE",
  OUT_OF_RANGE = "OUT_OF_RANGE",
  CLOSED = "CLOSED",
}

export const PositionRangeBadge = ({
  position: { liquidity, tickLower, tickUpper },
  price,
  className,
  ...props
}: {
  position: Position;
  price: string;
} & BadgeProps) => {
  const status = useMemo((): PositionRangeStatus => {
    if (liquidity === 0n) {
      return PositionRangeStatus.CLOSED;
    }
    const priceLower = calculateTickToPrice({
      tick: tickLower,
    });
    const priceUpper = calculateTickToPrice({
      tick: tickUpper,
    });

    if (new Big(price).lt(priceLower) || new Big(price).gt(priceUpper)) {
      return PositionRangeStatus.OUT_OF_RANGE;
    }
    return PositionRangeStatus.IN_RANGE;
  }, [liquidity, price, tickLower, tickUpper]);

  if (status === PositionRangeStatus.CLOSED) {
    return (
      <Badge className={cn("gap-1", className)} {...props}>
        <span>Closed</span>
        <InfoTooltip content="Your position has zero liquidity and is not earning fees." />
      </Badge>
    );
  }

  if (status === PositionRangeStatus.OUT_OF_RANGE) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge className={cn("gap-1 select-none", className)} {...props}>
              <DotIcon size={12} className="fill-warning" />
              <span>Out of Range</span>
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            The current pool price is outside your selected range. Your position
            is not earning fees.
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <Badge className={cn("gap-1", className)} {...props}>
      <DotIcon size={12} className="fill-success" />
      <span>In Range</span>
    </Badge>
  );
};
