import { Card, CardFigureInput, TokenIcon } from "@repo/ui/components";
import { useGetPoolTokenBalances, usePoolPositionContext } from "pool/hooks";
import { AddLiquidityInputsBlockProps } from "pool/types";
import { useIntl } from "react-intl";

export const AddLiquidityInputsBlock = ({
  inputOne,
  inputTwo,
  setInputOne,
  setInputTwo,
}: AddLiquidityInputsBlockProps) => {
  const { formatNumber } = useIntl();
  const { poolTokenOne, poolTokenTwo } = usePoolPositionContext();
  const { balances, tokenOneBalance, tokenTwoBalance } =
    useGetPoolTokenBalances();

  return (
    <>
      <div className="flex flex-col md:flex-row gap-4 w-full">
        <Card className="flex flex-row items-center justify-between px-4 py-6">
          <CardFigureInput
            placeholder="0.00"
            value={inputOne}
            className="normalize-input flex w-full max-w-[62%] md:max-w-[69%] text-ellipsis overflow-hidden"
            onChange={(e) => setInputOne(e.target.value)}
          />
          <div className="flex flex-col items-end w-[85px]">
            <div className="flex items-center gap-2 rounded-2xl justify-between mb-2">
              <TokenIcon symbol={poolTokenOne.symbol || ""} size={20} />
              <span>{poolTokenOne.symbol || ""}</span>
            </div>
            <span className="flex items-center gap-1">
              {formatNumber(parseFloat(balances[0]?.value || "0"), {
                minimumFractionDigits: 4,
                maximumFractionDigits: 4,
              })}{" "}
              <span
                onClick={() => {
                  setInputOne(
                    formatNumber(parseFloat(balances[0]?.value || "0"), {
                      minimumFractionDigits: tokenOneBalance?.coinDecimals,
                      maximumFractionDigits: tokenOneBalance?.coinDecimals,
                    }) || "",
                  );
                }}
                className="px-3 py-0 ml-2 rounded-2xl bg-grey-dark hover:bg-grey-medium text-white text-sm cursor-pointer transition"
              >
                Max
              </span>
            </span>
          </div>
        </Card>
        <Card className="flex flex-row items-center justify-between px-4 py-6">
          <CardFigureInput
            placeholder="0.00"
            value={inputTwo}
            className="normalize-input flex w-full max-w-[62%] md:max-w-[69%] text-ellipsis overflow-hidden"
            onChange={(e) => setInputTwo(e.target.value)}
          />
          <div className="flex flex-col items-end w-[85px]">
            <div className="flex items-center gap-2 rounded-2xl justify-between mb-2">
              <TokenIcon symbol={poolTokenTwo.symbol || ""} size={20} />
              <span>{poolTokenTwo.symbol || ""}</span>
            </div>
            <span className="flex items-center gap-1">
              {formatNumber(parseFloat(balances[1]?.value || "0"), {
                minimumFractionDigits: 4,
                maximumFractionDigits: 4,
              })}{" "}
              <span
                onClick={() => {
                  setInputTwo(
                    formatNumber(parseFloat(balances[1]?.value || "0"), {
                      minimumFractionDigits: tokenTwoBalance?.coinDecimals,
                      maximumFractionDigits: tokenTwoBalance?.coinDecimals,
                    }) || "",
                  );
                }}
                className="px-3 py-0 ml-2 rounded-2xl bg-grey-dark hover:bg-grey-medium text-white text-sm cursor-pointer transition"
              >
                Max
              </span>
            </span>
          </div>
        </Card>
      </div>
    </>
  );
};
