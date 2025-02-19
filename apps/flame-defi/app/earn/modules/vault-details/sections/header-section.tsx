import { InfoTooltip } from "@repo/ui/components";
import { ArrowLeftIcon } from "@repo/ui/icons";
import { Badge, Skeleton } from "@repo/ui/shadcn-primitives";
import { Image } from "earn/components/image";
import { usePageContext } from "earn/modules/vault-details/hooks/usePageContext";

export const HeaderSection = () => {
  const {
    query: { isPending, data },
  } = usePageContext();

  return (
    <section className="flex flex-col px-4 md:px-20">
      <div className="mt-18">
        <div className="relative flex">
          <div className="absolute -left-10 mt-2">
            <ArrowLeftIcon
              aria-label="Back"
              size={16}
              className="text-icon-light"
            />
          </div>

          <div className="flex flex-col space-y-3">
            <Skeleton isLoading={isPending} className="w-64 h-8">
              <div className="flex items-center space-x-2">
                <span className="text-3xl/8">{data?.vaultByAddress.name}</span>
                {data?.vaultByAddress.metadata?.description && (
                  <InfoTooltip
                    content={data.vaultByAddress.metadata.description}
                    side="right"
                  />
                )}
              </div>
            </Skeleton>
            <Skeleton isLoading={isPending} className="w-12 h-5">
              <div className="flex space-x-2">
                <Badge
                  variant="secondary"
                  className="flex items-center space-x-2"
                >
                  <Image
                    src={data?.vaultByAddress?.asset.logoURI}
                    alt={data?.vaultByAddress.asset.name}
                    width={16}
                    height={16}
                    className="rounded-full shrink-0"
                  />
                  <span>{data?.vaultByAddress.asset.symbol}</span>
                </Badge>
                {data?.vaultByAddress.metadata?.curators.map((it, index) => (
                  <Badge
                    key={`curator_${index}`}
                    variant="secondary"
                    className="flex items-center space-x-2"
                  >
                    <Image
                      src={it.image}
                      alt={it.name}
                      width={16}
                      height={16}
                      className="rounded-full shrink-0"
                    />
                    <span>{it.name}</span>
                  </Badge>
                ))}
              </div>
            </Skeleton>
          </div>
        </div>
      </div>
    </section>
  );
};
