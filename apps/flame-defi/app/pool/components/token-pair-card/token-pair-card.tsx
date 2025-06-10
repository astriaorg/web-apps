import type { EvmCurrency } from "@repo/flame-types";
import { Skeleton, TokenIcon } from "@repo/ui/components";

interface TokenPairCardProps {
  title?: React.ReactNode;
  token0?: EvmCurrency;
  token1?: EvmCurrency;
  value0?: React.ReactNode;
  value1?: React.ReactNode;
  isLoading: boolean;
}

export const TokenPairCard = ({
  title,
  token0,
  token1,
  value0,
  value1,
  isLoading,
}: TokenPairCardProps) => {
  return (
    <div className="flex flex-col gap-3 p-0">
      {title && (
        <div className="text-xs font-medium tracking-wider uppercase">
          {title}
        </div>
      )}
      <Skeleton isLoading={isLoading}>
        <div className="flex items-center gap-2 h-6">
          <TokenIcon size={16} symbol={token0?.coinDenom} />
          <div className="text-typography-light flex-1">
            {token0?.coinDenom}
          </div>
          <div className="text-sm font-medium text-typography-light truncate">
            {value0}
          </div>
        </div>
      </Skeleton>
      <Skeleton isLoading={isLoading}>
        <div className="flex items-center gap-2 h-6">
          <TokenIcon size={16} symbol={token1?.coinDenom} />
          <div className="text-typography-light flex-1">
            {token1?.coinDenom}
          </div>
          <div className="text-sm font-medium text-typography-light truncate">
            {value1}
          </div>
        </div>
      </Skeleton>
    </div>
  );
};
