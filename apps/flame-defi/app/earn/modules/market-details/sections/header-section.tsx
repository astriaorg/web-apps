import { Badge, Skeleton } from "@repo/ui/components";
import { Image } from "components/image";
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
              <div className="flex space-x-2">
                <div className="flex items-center -space-x-2 shrink-0">
                  {data?.marketByUniqueKey.collateralAsset && (
                    <Image
                      src={data?.marketByUniqueKey.collateralAsset.logoURI}
                      alt={data?.marketByUniqueKey.collateralAsset.symbol}
                      width={40}
                      height={40}
                      className="rounded-full"
                    />
                  )}
                  <Image
                    src={data?.marketByUniqueKey.loanAsset.logoURI}
                    alt={data?.marketByUniqueKey.loanAsset.symbol}
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                </div>
                <span className="text-3xl/8">
                  {data?.marketByUniqueKey.collateralAsset?.symbol}
                  {` / `}
                  {data?.marketByUniqueKey.loanAsset?.symbol}
                </span>
              </div>
            </Skeleton>
            <Skeleton isLoading={isPending} className="w-40">
              <div>
                <Badge variant="secondary">
                  {data?.marketByUniqueKey.collateralAsset?.name}
                </Badge>
              </div>
            </Skeleton>
          </div>
        )}
      </div>
    </section>
  );
};
