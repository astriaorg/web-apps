import { BackButton } from "earn/components/back-button";
import { MarketAssets } from "earn/components/market";
import { ROUTES } from "earn/constants/routes";
import { Asset, Maybe } from "earn/generated/gql/graphql";
import { usePageContext } from "earn/modules/market-details/hooks/use-page-context";
import { useRouter } from "next/navigation";

import { Badge, Skeleton } from "@repo/ui/components";

export const HeaderSection = () => {
  const router = useRouter();
  const {
    query: { data, isPending, status },
  } = usePageContext();

  return (
    <section className="flex flex-col px-4">
      <div className="relative mt-10 flex flex-col 2xl:flex-row 2xl:mt-18">
        <BackButton onClick={() => router.push(ROUTES.MARKET_LIST)} />

        {status !== "error" && (
          <div className="flex flex-col space-y-3">
            <Skeleton isLoading={isPending} className="w-64">
              <MarketAssets
                assetA={data?.marketByUniqueKey.collateralAsset as Maybe<Asset>}
                assetB={data?.marketByUniqueKey.loanAsset as Maybe<Asset>}
                size={40}
                className="text-3xl/8 font-medium"
              />
            </Skeleton>
            <Skeleton isLoading={isPending} className="w-40 h-5">
              {data?.marketByUniqueKey.collateralAsset && (
                <Badge variant="secondary" className="whitespace-nowrap w-min">
                  {data?.marketByUniqueKey.collateralAsset?.name}
                </Badge>
              )}
            </Skeleton>
          </div>
        )}
      </div>
    </section>
  );
};
