import { AddLiquidityInputsBlockProps, POOL_INPUT_ID } from "pool/types";
import { useIntl } from "react-intl";

import {
  Card,
  CardFigureInput,
  Skeleton,
  TokenIcon,
} from "@repo/ui/components";
import { isDustAmount } from "@repo/ui/utils";

export const AddLiquidityInputsBlock = ({
  input0,
  input1,
  token0,
  token1,
  token0Balance,
  token1Balance,
  handleInputChange,
}: AddLiquidityInputsBlockProps) => {
  const { formatNumber } = useIntl();
  const isLoading = token0 === null || token1 === null;

  const inputsArray = [
    {
      id: POOL_INPUT_ID.INPUT_ZERO,
      input: input0,
      handleInputChange: handleInputChange,
      tokenBalance: token0Balance,
      token: token0,
    },
    {
      id: POOL_INPUT_ID.INPUT_ONE,
      input: input1,
      handleInputChange: handleInputChange,
      tokenBalance: token1Balance,
      token: token1,
    },
  ];

  return (
    <>
      <div className="flex flex-col md:flex-row gap-4 w-full">
        {inputsArray.map(
          ({ id, input, handleInputChange, tokenBalance, token }, index) => {
            const maxInputValue =
              tokenBalance && tokenBalance?.value && token?.coinDecimals
                ? formatNumber(parseFloat(tokenBalance.value), {
                    minimumFractionDigits: token.coinDecimals,
                    maximumFractionDigits: token.coinDecimals,
                  })
                : null;

            return (
              <Card
                className="flex flex-row items-center justify-between px-4 py-6"
                key={index}
              >
                <Skeleton isLoading={isLoading}>
                  <CardFigureInput
                    placeholder="0.00"
                    value={input}
                    className="normalize-input flex w-full max-w-[62%] md:max-w-[82%] text-ellipsis overflow-hidden"
                    onChange={(e) =>
                      handleInputChange(e.target.value, id, token?.coinDecimals)
                    }
                  />
                  <div className="flex flex-col items-end w-[85px]">
                    {token && (
                      <div className="flex items-center gap-2 rounded-2xl justify-between mb-2">
                        <TokenIcon symbol={token.coinDenom} size={20} />
                        <span>{token.coinDenom}</span>
                      </div>
                    )}
                    {maxInputValue &&
                      tokenBalance &&
                      !isDustAmount(tokenBalance.value) && (
                        <span className="flex items-center gap-1">
                          {formatNumber(parseFloat(tokenBalance.value), {
                            minimumFractionDigits: 4,
                            maximumFractionDigits: 4,
                          })}{" "}
                          <span
                            onClick={() => {
                              handleInputChange(
                                formatNumber(parseFloat(tokenBalance.value), {
                                  minimumFractionDigits: token?.coinDecimals,
                                  maximumFractionDigits: token?.coinDecimals,
                                }),
                                id,
                                token?.coinDecimals,
                              );
                            }}
                            className="px-3 py-0 ml-2 rounded-2xl bg-grey-dark hover:bg-grey-medium text-white text-sm cursor-pointer transition"
                          >
                            Max
                          </span>
                        </span>
                      )}
                  </div>
                </Skeleton>
              </Card>
            );
          },
        )}
      </div>
    </>
  );
};
