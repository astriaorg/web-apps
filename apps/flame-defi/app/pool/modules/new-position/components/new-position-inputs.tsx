import { useIntl } from "react-intl";

import { Card, CardFigureInput, TokenSelector } from "@repo/ui/components";
import { isDustAmount } from "@repo/ui/utils";
import { useEvmCurrencyBalance } from "features/evm-wallet";
import { NewPositionInputsProps } from "pool/types";

export const NewPositionInputs = ({
  input0,
  input1,
  setInput0,
  setInput1,
  currencies,
}: NewPositionInputsProps) => {
  const { formatNumber } = useIntl();
  const { balance: token0Balance } = useEvmCurrencyBalance(input0.token);
  const { balance: token1Balance } = useEvmCurrencyBalance(input1.token);
  const inputsArray = [
    { input: input0, setInput: setInput0, tokenBalance: token0Balance },
    { input: input1, setInput: setInput1, tokenBalance: token1Balance },
  ];

  return (
    <div className="flex flex-col gap-4 w-full">
      {inputsArray.map(({ input, setInput, tokenBalance }, index) => {
        const maxInputValue =
          tokenBalance && input.token?.coinDecimals
            ? formatNumber(parseFloat(tokenBalance.value), {
                minimumFractionDigits: input.token.coinDecimals,
                maximumFractionDigits: input.token.coinDecimals,
              })
            : null;

        return (
          <Card
            className="flex flex-row items-center justify-between px-4 py-6"
            key={index}
          >
            <CardFigureInput
              placeholder="0.00"
              value={input.value}
              className="normalize-input flex w-full max-w-[62%] md:max-w-[75%] text-ellipsis overflow-hidden"
              onChange={(e) => setInput({ ...input, value: e.target.value })}
            />
            <div className="flex flex-col items-end w-[85px]">
              <TokenSelector
                tokens={currencies}
                selectedToken={input.token}
                unavailableToken={input1.token}
                setSelectedToken={(token) => setInput({ ...input, token })}
              />
              {maxInputValue &&
                tokenBalance &&
                !isDustAmount(tokenBalance.value) && (
                  <span className="flex items-center gap-1 mt-2">
                    {formatNumber(parseFloat(tokenBalance.value), {
                      minimumFractionDigits: 4,
                      maximumFractionDigits: 4,
                    })}{" "}
                    <span
                      onClick={() => {
                        setInput({
                          ...input,
                          value: maxInputValue,
                        });
                      }}
                      className="px-3 py-0 ml-2 rounded-2xl bg-grey-dark hover:bg-grey-medium text-white text-sm cursor-pointer transition"
                    >
                      Max
                    </span>
                  </span>
                )}
            </div>
          </Card>
        );
      })}
    </div>
  );
};
