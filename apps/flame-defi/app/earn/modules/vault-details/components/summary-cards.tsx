import { formatAbbreviatedNumber } from "@repo/ui/utils";
import Big from "big.js";
import {
  SummaryCard,
  SummaryCardFigureText,
  SummaryCardLabel,
} from "earn/components/summary-card";
import { usePageContext } from "earn/modules/vault-details/hooks/usePageContext";
import { FormattedNumber } from "react-intl";

export const SummaryCards = () => {
  const {
    query: { isPending, data },
  } = usePageContext();

  const { value: formattedLiquidity, suffix: formattedLiquiditySuffix } =
    formatAbbreviatedNumber(
      new Big(data?.vaultByAddress.liquidity?.underlying ?? 0)
        .div(10 ** (data?.vaultByAddress.asset.decimals ?? 18))
        .toFixed(),
      {
        minimumFractionDigits: 2,
      },
    );

  const { value: formattedTotalAssets, suffix: formattedTotalAssetsSuffix } =
    formatAbbreviatedNumber(
      new Big(data?.vaultByAddress.state?.totalAssets ?? 0)
        .div(10 ** (data?.vaultByAddress.asset.decimals ?? 18))
        .toFixed(),
      {
        minimumFractionDigits: 2,
      },
    );

  return (
    <div className="grid lg:grid-cols-3 gap-2">
      <SummaryCard isLoading={isPending} className="bg-orange">
        <SummaryCardLabel className="text-text">APY</SummaryCardLabel>
        <SummaryCardFigureText>
          <FormattedNumber
            value={data?.vaultByAddress.state?.apy ?? 0}
            style="percent"
            minimumFractionDigits={2}
          />
        </SummaryCardFigureText>
      </SummaryCard>
      <SummaryCard isLoading={isPending}>
        <SummaryCardLabel>
          <span>Total Deposits</span>
          <span>{data?.vaultByAddress.asset.symbol}</span>
        </SummaryCardLabel>
        <SummaryCardFigureText>
          {formattedTotalAssets}
          {formattedTotalAssetsSuffix}
        </SummaryCardFigureText>
      </SummaryCard>
      <SummaryCard isLoading={isPending}>
        <SummaryCardLabel>
          <span>Liquidity</span>
          <span>{data?.vaultByAddress.asset.symbol}</span>
        </SummaryCardLabel>
        <SummaryCardFigureText>
          {formattedLiquidity}
          {formattedLiquiditySuffix}
        </SummaryCardFigureText>
      </SummaryCard>
    </div>
  );
};
