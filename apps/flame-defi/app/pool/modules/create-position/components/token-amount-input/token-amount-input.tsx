import type { EvmCurrency } from "@repo/flame-types";
import {
  Badge,
  Card,
  CardContent,
  CardFigureInput,
  Skeleton,
} from "@repo/ui/components";
import { useFormatAbbreviatedNumber } from "@repo/ui/hooks";
import { TokenSelect } from "pool/components/token-select";

interface TokenAmountInputProps {
  value: string;
  onInput: ({ value }: { value: string }) => void;
  selectedToken?: EvmCurrency;
  setSelectedToken: (value?: EvmCurrency) => void;
  options: EvmCurrency[];
  balance: { value: string; symbol: string } | null;
  isLoading: boolean;
}

export const TokenAmountInput = ({
  value,
  onInput,
  selectedToken,
  setSelectedToken,
  options,
  balance,
  isLoading,
}: TokenAmountInputProps) => {
  const { formatAbbreviatedNumber } = useFormatAbbreviatedNumber();

  return (
    <Card variant="secondary">
      <CardContent className="flex items-center justify-between gap-6">
        <CardFigureInput
          value={value}
          onInput={(event) =>
            onInput({
              value: event.currentTarget.value,
            })
          }
        />
        <div className="flex flex-col gap-1 items-end pt-5">
          <TokenSelect
            options={options}
            value={selectedToken}
            onValueChange={setSelectedToken}
          />

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
        </div>
      </CardContent>
    </Card>
  );
};
