import { Card, CardFigureInput, TokenSelector } from "@repo/ui/components";
import { isDustAmount } from "@repo/ui/utils";
import { NewPositionInputsProps, POOL_INPUT_ID } from "pool/types";
import { useIntl } from "react-intl";

export const NewPositionInputs = ({
  input0,
  input1,
  handleInputChange,
  handleTokenChange,
  currencies,
  token0Balance,
  token1Balance,
}: NewPositionInputsProps) => {
  const { formatNumber } = useIntl();

  const inputsArray = [
    {
      id: POOL_INPUT_ID.INPUT_ZERO,
      input: input0,
      handleInputChange: handleInputChange,
      handleTokenChange: handleTokenChange,
      tokenBalance: token0Balance,
    },
    {
      id: POOL_INPUT_ID.INPUT_ONE,
      input: input1,
      handleInputChange: handleInputChange,
      handleTokenChange: handleTokenChange,
      tokenBalance: token1Balance,
    },
  ];

  return (
    <div className="flex flex-col gap-4 w-full">
      {inputsArray.map(
        (
          { id, input, handleInputChange, handleTokenChange, tokenBalance },
          index
        ) => {
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
                onChange={(e) =>
                  handleInputChange(
                    e.target.value,
                    id,
                    input.token?.coinDecimals
                  )
                }
              />
              <div className="flex flex-col items-end w-[85px]">
                <TokenSelector
                  tokens={currencies}
                  selectedToken={input.token}
                  unavailableToken={input1.token}
                  setSelectedToken={(token) => handleTokenChange(token, id)}
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
                          handleInputChange(
                            maxInputValue,
                            id,
                            input.token?.coinDecimals
                          );
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
        }
      )}
    </div>
  );
};
