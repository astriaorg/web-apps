import { useIntl } from "react-intl";

import { Badge } from "@repo/ui/components";
import type { Position } from "pool/types";

export const PositionFeeBadge = ({
  position: { fee },
}: {
  position: Position;
}) => {
  const { formatNumber } = useIntl();

  return (
    <Badge className="flex items-center space-x-2">
      {formatNumber(fee / 10000000, {
        style: "percent",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}
    </Badge>
  );
};
