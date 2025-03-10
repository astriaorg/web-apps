import { Badge, Skeleton } from "@repo/ui/components";
import { MarketAssets } from "earn/components/market";
import { Asset, Maybe } from "earn/generated/gql/graphql";
import { usePageContext } from "earn/modules/market-details/hooks/use-page-context";

export const HeaderSection = () => {
  const {
    query: { data, isPending, status },
  } = usePageContext();

  return (
    <section className="flex flex-col px-4">
      <div className="mt-18 flex flex-col">
        {status !== "error" && (
          <div className="flex flex-col space-y-3">
            <Skeleton isLoading={isPending}>
              <MarketAssets
                assetA={data?.marketByUniqueKey.collateralAsset as Maybe<Asset>}
                assetB={data?.marketByUniqueKey.loanAsset as Maybe<Asset>}
                size={40}
              />
            </Skeleton>
            {data?.marketByUniqueKey.collateralAsset && (
              <Skeleton isLoading={isPending} className="w-40">
                <Badge variant="secondary">
                  {data?.marketByUniqueKey.collateralAsset?.name}
                </Badge>
              </Skeleton>
            )}
          </div>
        )}
      </div>
    </section>
  );
};
