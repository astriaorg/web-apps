import type { EvmCurrency } from "@repo/flame-types";
import { Card, CardContent, CardFigureInput } from "@repo/ui/components";
import { useEvmChainData } from "config";
import { TokenSelect } from "pool/components/token-select";
import { useMemo } from "react";

interface TokenAmountInputProps {
  value: string;
  onInput: ({ value }: { value: string }) => void;
  selectedToken?: EvmCurrency;
  setSelectedToken: (value?: EvmCurrency) => void;
}

export const TokenAmountInput = ({
  value,
  onInput,
  selectedToken,
  setSelectedToken,
}: TokenAmountInputProps) => {
  const { selectedChain } = useEvmChainData();

  const options = useMemo(() => {
    return selectedChain.currencies.filter(
      (currency) =>
        currency.erc20ContractAddress !== selectedToken?.erc20ContractAddress,
    );
  }, [selectedChain.currencies, selectedToken]);

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
