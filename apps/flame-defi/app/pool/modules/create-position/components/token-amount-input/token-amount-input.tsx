import type { EvmCurrency } from "@repo/flame-types";
import { Card, CardContent, CardFigureInput } from "@repo/ui/components";
import { TokenSelect } from "pool/components/token-select";

interface TokenAmountInputProps {
  value: string;
  onInput: ({ value }: { value: string }) => void;
  selectedToken?: EvmCurrency;
  setSelectedToken: (value?: EvmCurrency) => void;
  options: EvmCurrency[];
}

export const TokenAmountInput = ({
  value,
  onInput,
  selectedToken,
  setSelectedToken,
  options,
}: TokenAmountInputProps) => {
  return (
    <Card>
      <CardContent className="flex items-center justify-between gap-6">
        <CardFigureInput
          value={value}
          onInput={(event) =>
            onInput({
              value: event.currentTarget.value,
            })
          }
        />
        <div>
          <TokenSelect
            options={options}
            value={selectedToken}
            onValueChange={setSelectedToken}
          />
        </div>
      </CardContent>
    </Card>
  );
};
