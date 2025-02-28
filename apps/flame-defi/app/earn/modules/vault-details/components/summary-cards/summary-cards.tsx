import { formatAbbreviatedNumber } from "@repo/ui/utils";
import Big from "big.js";
import { Card, CardFigureText, CardLabel } from "earn/components/card";
import { usePageContext } from "earn/modules/vault-details/hooks/use-page-context";
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
      <Card isLoading={isPending} padding="md" variant="accent">
        <CardLabel>APY</CardLabel>
        <CardFigureText>
          <FormattedNumber
            value={data?.vaultByAddress.state?.netApy ?? 0}
            style="percent"
            minimumFractionDigits={2}
          />
        </CardFigureText>
      </Card>
      <Card isLoading={isPending} padding="md">
        <CardLabel>
          <span className="flex-1">Total Deposits</span>
          <span>{data?.vaultByAddress.asset.symbol}</span>
        </CardLabel>
        <CardFigureText className="truncate">
          {formattedTotalAssets}
          {formattedTotalAssetsSuffix}
        </CardFigureText>
      </Card>
      <Card isLoading={isPending} padding="md">
        <CardLabel>
          <span className="flex-1">Liquidity</span>
          <span>{data?.vaultByAddress.asset.symbol}</span>
        </CardLabel>
        <CardFigureText className="truncate">
          {formattedLiquidity}
          {formattedLiquiditySuffix}
        </CardFigureText>
      </Card>
    </div>
  );
};
