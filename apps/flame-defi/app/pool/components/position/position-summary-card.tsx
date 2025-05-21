import type { EvmCurrency } from "@repo/flame-types";
import { Card, CardContent, MultiTokenIcon } from "@repo/ui/components";
import { PositionRangeBadge } from "pool/components/position/position-range-badge";
import type { Position } from "pool/types";

export const PositionSummaryCard = ({
  position,
  token0,
  token1,
  isLoading,
}: {
  position?: Position;
  token0?: EvmCurrency;
  token1?: EvmCurrency;
  isLoading: boolean;
}) => {
  return (
    <Card isLoading={isLoading}>
      <CardContent className="flex flex-col gap-3 h-full">
        <MultiTokenIcon
          symbols={[token0?.coinDenom ?? "", token1?.coinDenom ?? ""]}
        />
        <div className="text-2xl">
          {token0?.coinDenom}/{token1?.coinDenom}
        </div>
        <div className="flex-1" />
        {position && (
          <PositionRangeBadge
            position={position}
            className="p-0 bg-transparent"
          />
        )}
      </CardContent>
    </Card>
  );
};
