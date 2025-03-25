import { cn } from "@repo/ui/utils";
import { Image } from "components/image";
import { Asset, Maybe } from "earn/generated/gql/graphql";

interface MarketAssetsProps extends React.HTMLAttributes<HTMLDivElement> {
  assetA?: Maybe<Asset>;
  assetB: Maybe<Asset>;
  size: number;
}

export const MarketAssets = ({
  assetA,
  assetB,
  size,
  className,
  ...props
}: MarketAssetsProps) => {
  return (
    <div className={cn("flex items-center space-x-2", className)} {...props}>
      <div className="flex items-center -space-x-2 shrink-0">
        {assetA && (
          <Image
            src={assetA.logoURI}
            alt={assetA.symbol}
            width={size}
            height={size}
            className="rounded-full"
          />
        )}
        <Image
          src={assetB?.logoURI}
          alt={assetB?.symbol}
          width={size}
          height={size}
          className="rounded-full"
        />
      </div>
      <span className="truncate">
        {assetA?.symbol ? `${assetA.symbol} / ` : ""}
        {assetB?.symbol}
      </span>
    </div>
  );
};
