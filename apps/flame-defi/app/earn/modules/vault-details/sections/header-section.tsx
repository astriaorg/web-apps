import { Badge, InfoTooltip, Skeleton } from "@repo/ui/components";
import { Image } from "components/image";
import { BackButton } from "earn/components/back-button";
import { ROUTES } from "earn/constants/routes";
import { usePageContext } from "earn/modules/vault-details/hooks/use-page-context";
import { useRouter } from "next/navigation";

export const HeaderSection = () => {
  const router = useRouter();
  const {
    query: { data, isPending, status },
  } = usePageContext();

  return (
    <section className="flex flex-col px-4">
      <div className="relative mt-10 flex flex-col 2xl:flex-row 2xl:mt-18">
        <BackButton onClick={() => router.push(ROUTES.VAULT_LIST)} />

        {status !== "error" && (
          <div className="flex flex-col space-y-3">
            <Skeleton isLoading={isPending} className="w-64 h-8">
              <div className="flex items-center space-x-3">
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
                    className="rounded-full"
                  />
                  <span>{data?.vaultByAddress.asset.symbol}</span>
                </Badge>
                {data?.vaultByAddress.metadata?.curators?.map((it, index) => (
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
                      className="rounded-full"
                    />
                    <span>{it.name}</span>
                  </Badge>
                ))}
              </div>
            </Skeleton>
          </div>
        )}
      </div>
    </section>
  );
};
