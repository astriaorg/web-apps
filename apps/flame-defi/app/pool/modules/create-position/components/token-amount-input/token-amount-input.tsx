import type { EvmCurrency } from "@repo/flame-types";
import { Badge, Card, CardContent, CardFigureInput } from "@repo/ui/components";
import { useFormatAbbreviatedNumber } from "@repo/ui/hooks";
import { TokenSelect } from "pool/components/token-select";

interface TokenAmountInputProps {
  value: string;
  onInput: ({ value }: { value: string }) => void;
  selectedToken?: EvmCurrency;
  setSelectedToken: (value?: EvmCurrency) => void;
  options: EvmCurrency[];
  balance: { value: string; symbol: string } | null;
}

export const TokenAmountInput = ({
  value,
  onInput,
  selectedToken,
  setSelectedToken,
  options,
  balance,
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
        <div className="flex flex-col gap-1 items-end pt-6">
          <TokenSelect
            options={options}
            value={selectedToken}
            onValueChange={setSelectedToken}
          />

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
            <div className="h-6" />
          )}
        </div>
      </CardContent>
    </Card>
  );
};
