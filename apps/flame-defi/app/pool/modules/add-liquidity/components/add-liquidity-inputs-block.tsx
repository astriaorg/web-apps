import { Card, CardFigureInput, TokenIcon } from "@repo/ui/components";
import { usePoolDetailsContext } from "pool/hooks";

export const AddLiquidityInputsBlock = () => {
  const { tokenData } = usePoolDetailsContext();
  return (
    <>
      <div className="flex gap-4 w-full">
        <Card className="flex flex-row items-center justify-between px-4 py-6">
          <CardFigureInput placeholder="0.00" className="flex w-full" />
          <div className="flex flex-col items-end w-[85px]">
            <div className="flex items-center gap-2 rounded-2xl justify-between mb-2">
              <TokenIcon symbol={tokenData[0]?.symbol || ""} size={20} />
              <span>{tokenData[0]?.symbol || ""}</span>
            </div>
            <span
              onClick={() => {
                // TODO: Implement max button
                console.log("max");
              }}
              className="px-3 py-0 ml-2 rounded-2xl bg-grey-dark hover:bg-grey-medium text-orange-soft text-sm cursor-pointer transition"
            >
              Max
            </span>
          </div>
        </Card>
        <Card className="flex flex-row items-center justify-between px-4 py-6">
          <CardFigureInput placeholder="0.00" className="flex w-full" />
          <div className="flex flex-col items-end w-[85px]">
            <div className="flex items-center gap-2 rounded-2xl justify-between mb-2">
              <TokenIcon symbol={tokenData[1]?.symbol || ""} size={20} />
              <span>{tokenData[1]?.symbol || ""}</span>
            </div>
            <span
              onClick={() => {
                // TODO: Implement max button
                console.log("max");
              }}
              className="px-3 py-0 ml-2 rounded-2xl bg-grey-dark hover:bg-grey-medium text-orange-soft text-sm cursor-pointer transition"
            >
              Max
            </span>
          </div>
        </Card>
      </div>
    </>
  );
};
