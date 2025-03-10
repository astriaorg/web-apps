import { Image } from "components/image";
import { Asset, Maybe } from "earn/generated/gql/graphql";

interface MarketAssetsProps {
  assetA?: Maybe<Asset>;
  assetB: Maybe<Asset>;
  size: number;
}

export const MarketAssets = ({ assetA, assetB, size }: MarketAssetsProps) => {
  return (
    <div className="flex items-center space-x-2 lg:hidden">
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
