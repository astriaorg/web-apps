import Big from "big.js";
import { Card } from "earn/components/card";
import {
  SummaryCard,
  SummaryCardContent,
  SummaryCardLabel,
} from "earn/components/summary-card";
import { usePageContext } from "earn/modules/vault-details/hooks/usePageContext";
import { FormattedNumber } from "react-intl";
import { formatAbbreviatedNumber } from "utils";

export const CardsSection = () => {
  const {
    query: { isPending, data },
  } = usePageContext();

  const { value: formattedLiquidity, suffix: formattedLiquiditySuffix } =
    formatAbbreviatedNumber({
      value: new Big(data?.vaultByAddress.liquidity?.underlying ?? 0)
        .div(10 ** (data?.vaultByAddress.asset.decimals ?? 18))
        .toFixed(),
      dp: 2,
    });

  const { value: formattedTotalAssets, suffix: formattedTotalAssetsSuffix } =
    formatAbbreviatedNumber({
      value: new Big(data?.vaultByAddress.state?.totalAssets ?? 0)
        .div(10 ** (data?.vaultByAddress.asset.decimals ?? 18))
        .toFixed(),
      dp: 2,
    });

  return (
    <section className="flex flex-col px-4 md:px-20">
      <div className="grid grid-cols-3 gap-4 mt-12">
        <div className="col-span-2 grid grid-cols-3 gap-2">
          <SummaryCard isLoading={isPending} className="bg-orange">
            <SummaryCardLabel className="text-text">APY</SummaryCardLabel>
            <SummaryCardContent>
              <FormattedNumber
                value={data?.vaultByAddress.state?.apy ?? 0}
                style="percent"
                minimumFractionDigits={2}
              />
            </SummaryCardContent>
          </SummaryCard>
          <SummaryCard isLoading={isPending}>
            <SummaryCardLabel>
              <span>Total Deposits</span>
              <span>{data?.vaultByAddress.asset.symbol}</span>
            </SummaryCardLabel>
            <SummaryCardContent>
              {formattedTotalAssets}
              {formattedTotalAssetsSuffix}
            </SummaryCardContent>
          </SummaryCard>
          <SummaryCard isLoading={isPending}>
            <SummaryCardLabel>
              <span>Liquidity</span>
              <span>{data?.vaultByAddress.asset.symbol}</span>
            </SummaryCardLabel>
            <SummaryCardContent>
              {formattedLiquidity}
              {formattedLiquiditySuffix}
            </SummaryCardContent>
          </SummaryCard>
        </div>
        <div>
          <Card></Card>
        </div>
      </div>
    </section>
  );
};
