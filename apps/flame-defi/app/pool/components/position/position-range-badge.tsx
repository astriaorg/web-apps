import { Badge, InfoTooltip } from "@repo/ui/components";
import { DotIcon } from "@repo/ui/icons";
import type { Position } from "pool/types";

export const PositionRangeBadge = ({
  position: { liquidity },
}: {
  position: Position;
}) => {
  const isPositionClosed = liquidity === 0n;

  return (
    <>
      {!isPositionClosed ? (
        <Badge className="gap-1">
          <DotIcon size={12} className="fill-success" />
          <span>In Range</span>
        </Badge>
      ) : (
        <Badge className="gap-1">
          <span>Closed</span>
          <InfoTooltip content="Your position has zero liquidity and is not earning fees." />
        </Badge>
      )}
    </>
  );
};
