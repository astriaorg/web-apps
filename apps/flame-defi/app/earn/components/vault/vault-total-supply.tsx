import { Badge } from "@repo/ui/components";
import { FormattedNumber } from "@repo/ui/intl";
import { cn, formatAbbreviatedNumber } from "@repo/ui/utils";
import Big from "big.js";
import { NON_BREAKING_SPACE } from "earn/constants/utils";
import { Vault } from "earn/gql/graphql";

interface VaultTotalSupplyProps {
  vault: Vault;
}

export const VaultTotalSupply = ({ vault }: VaultTotalSupplyProps) => {
  const { value: formattedTotalAssets, suffix: formattedTotalAssetsSuffix } =
    formatAbbreviatedNumber(
      new Big(vault.state?.totalAssets ?? 0)
        .div(10 ** vault.asset.decimals)
        .toFixed(),
      {
        minimumFractionDigits: 2,
      },
    );

  const {
    value: formattedTotalAssetsUSD,
    suffix: formattedTotalAssetsUSDSuffix,
  } = formatAbbreviatedNumber(
    new Big(vault.state?.totalAssetsUsd ?? 0).toFixed(),
    {
      minimumFractionDigits: 2,
    },
  );

  return (
    <div
      className={cn(
        "flex flex-col items-start space-x-0 space-y-1",
        "md:flex-row md:items-center md:space-x-3 md:space-y-0",
      )}
    >
      <span
        className={cn(
          "text-xs/3 truncate max-w-[25vw]",
          "md:text-base/4 md:max-w-auto",
        )}
      >
        {formattedTotalAssets}
        {formattedTotalAssetsSuffix}
        {NON_BREAKING_SPACE}
        {vault.symbol}
      </span>
      <Badge>
        <FormattedNumber
          value={+formattedTotalAssetsUSD}
          style="currency"
          currency="USD"
        />
        {formattedTotalAssetsUSDSuffix}
      </Badge>
    </div>
  );
};
