import { Card, CardFigureInput, TokenIcon } from "@repo/ui/components";
import { isDustAmount } from "@repo/ui/utils";
import { useGetPoolTokenBalances } from "pool/hooks";
import { AddLiquidityInputsBlockProps } from "pool/types";
import { useIntl } from "react-intl";

export const AddLiquidityInputsBlock = ({
  inputOne,
  inputTwo,
  setInputOne,
  setInputTwo,
  poolTokenOne,
  poolTokenTwo,
}: AddLiquidityInputsBlockProps) => {
  const { formatNumber } = useIntl();
  const { tokenOne, tokenTwo, tokenOneBalance, tokenTwoBalance } =
    useGetPoolTokenBalances(
      poolTokenOne.token.coinDenom,
      poolTokenTwo.token.coinDenom,
    );

  // NOTE: This data is temporary. The token data will likely be coming from the API.
  const inputsArray = [
    {
      input: inputOne,
      setInput: setInputOne,
      tokenBalance: tokenOneBalance,
      token: tokenOne,
    },
    {
      input: inputTwo,
      setInput: setInputTwo,
      tokenBalance: tokenTwoBalance,
      token: tokenTwo,
    },
  ];

  return (
    <>
      <div className="flex flex-col md:flex-row gap-4 w-full">
        {inputsArray.map(({ input, setInput, tokenBalance, token }, index) => {
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
              <CardFigureInput
                placeholder="0.00"
                value={input}
                className="normalize-input flex w-full max-w-[62%] md:max-w-[69%] text-ellipsis overflow-hidden"
                onChange={(e) => setInput(e.target.value)}
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
                          setInput(
                            formatNumber(parseFloat(tokenBalance.value), {
                              minimumFractionDigits: token?.coinDecimals,
                              maximumFractionDigits: token?.coinDecimals,
                            }),
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
        })}
      </div>
    </>
  );
};
