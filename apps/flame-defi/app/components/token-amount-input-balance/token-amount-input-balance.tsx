import { Badge, Skeleton } from "@repo/ui/components";
import { useFormatAbbreviatedNumber } from "@repo/ui/hooks";

export interface TokenAmountInputBalanceProps {
  onInput: ({ value }: { value: string }) => void;
  balance: {
    value: string;
    symbol: string;
  } | null;
  isLoading: boolean;
}

export const TokenAmountInputBalance = ({
  onInput,
  balance,
  isLoading,
}: TokenAmountInputBalanceProps) => {
  const { formatAbbreviatedNumber } = useFormatAbbreviatedNumber();

  return (
    <Skeleton isLoading={isLoading} className="w-20 h-5">
      {balance ? (
        <div className="flex items-center gap-1">
          <span className="text-xs">
            {formatAbbreviatedNumber(balance.value, {
              minimumFractionDigits: 4,
              maximumFractionDigits: 4,
            })}
            &nbsp;
            {balance.symbol}
          </span>
          <Badge
            variant="secondary"
            className="cursor-pointer"
            onClick={() => {
              onInput({
                value: balance.value,
              });
            }}
          >
            Max
          </Badge>
        </div>
      ) : (
        <div className="h-5" />
      )}
    </Skeleton>
  );
};
