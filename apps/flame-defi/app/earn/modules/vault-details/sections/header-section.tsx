import { InfoTooltip } from "@repo/ui/components";
import { ArrowLeftIcon } from "@repo/ui/icons";
import { Badge, Skeleton } from "@repo/ui/shadcn-primitives";
import { Image } from "earn/components/image";
import { ROUTES } from "earn/constants/routes";
import { usePageContext } from "earn/modules/vault-details/hooks/use-page-context";
import { useRouter } from "next/navigation";

export const HeaderSection = () => {
  const router = useRouter();
  const {
    query: { isPending, data },
  } = usePageContext();

  return (
    <section className="flex flex-col px-4 md:px-20">
      <div className="mt-18">
        <div className="relative flex flex-col md:flex-row">
          <div
            className="mb-10 md:absolute md:-left-10 md:mt-2 md:mb-0"
            onClick={() => router.push(ROUTES.VAULT_LIST)}
          >
            <ArrowLeftIcon
              aria-label="Back"
              size={16}
              className="cursor-pointer text-icon-light hover:text-text"
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
                  variant="subdued"
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
                    variant="subdued"
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
