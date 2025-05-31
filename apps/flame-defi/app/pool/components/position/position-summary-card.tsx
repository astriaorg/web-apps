import type { EvmCurrency } from "@repo/flame-types";
import {
  Card,
  CardContent,
  CardTitle,
  MultiTokenIcon,
  Skeleton,
} from "@repo/ui/components";
import { PositionRangeBadge } from "pool/components/position/position-range-badge";
import type { Position } from "pool/types";

export const PositionSummaryCard = ({
  position,
  price,
  token0,
  token1,
  isLoading,
}: {
  position?: Position;
  price?: string;
  token0?: EvmCurrency;
  token1?: EvmCurrency;
  isLoading: boolean;
}) => {
  return (
    <Card isLoading={isLoading}>
      <CardContent className="flex flex-col gap-3 h-full">
        <Skeleton isLoading={isLoading} className="w-full h-6">
          <MultiTokenIcon
            size={24}
            symbols={[token0?.coinDenom ?? "", token1?.coinDenom ?? ""]}
          />
        </Skeleton>
        <CardTitle>
          {token0?.coinDenom}/{token1?.coinDenom}
        </CardTitle>
        <div className="flex-1" />
        {position && price ? (
          <PositionRangeBadge
            position={position}
            price={price}
            className="p-0 bg-transparent"
          />
        ) : (
          <div className="h-4" />
        )}
      </CardContent>
    </Card>
  );
};
