import { Badge, InfoTooltip } from "@repo/ui/components";
import { DotIcon } from "@repo/ui/icons";

interface PositionRangeBadgeProps {
  isPositionClosed: boolean;
}

export const PositionRangeBadge = ({
  isPositionClosed,
}: PositionRangeBadgeProps) => {
  return (
    <>
      {!isPositionClosed ? (
        <Badge variant="default" className="flex items-center space-x-2 z-2">
          <DotIcon size={12} className="fill-green z-999999999" />
          <span>In range</span>
        </Badge>
      ) : (
        <Badge variant="default" className="flex items-center space-x-2 z-2">
          <span>Closed</span>
          <InfoTooltip content="Your position has zero liquidity and is not earning fees." />
        </Badge>
      )}
    </>
  );
};
