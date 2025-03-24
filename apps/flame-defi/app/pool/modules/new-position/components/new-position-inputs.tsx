import { Card, CardFigureInput, TokenSelector } from "@repo/ui/components";
import { isDustAmount } from "@repo/ui/utils";
import { useGetPoolTokenBalances } from "pool/hooks";
import { NewPositionInputsProps } from "pool/types";
import { useIntl } from "react-intl";

export const NewPositionInputs = ({
  inputOne,
  inputTwo,
  setInputOne,
  setInputTwo,
  currencies,
}: NewPositionInputsProps) => {
  const { formatNumber } = useIntl();
  const { tokenOneBalance, tokenTwoBalance } = useGetPoolTokenBalances(
    inputOne.token?.coinDenom || "",
    inputTwo.token?.coinDenom || "",
  );
  const inputsArray = [
    { input: inputOne, setInput: setInputOne, tokenBalance: tokenOneBalance },
    { input: inputTwo, setInput: setInputTwo, tokenBalance: tokenTwoBalance },
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
              className="normalize-input flex w-full max-w-[62%] md:max-w-[60%] text-ellipsis overflow-hidden"
              onChange={(e) => setInput({ ...input, value: e.target.value })}
            />
            <div className="flex flex-col items-end w-[85px]">
              <TokenSelector
                tokens={currencies}
                selectedToken={input.token}
                unavailableToken={inputTwo.token}
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
