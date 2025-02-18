import { ArrowDownIcon } from "@repo/ui/icons";
import { Skeleton } from "@repo/ui/shadcn-primitives";
import { usePageContext } from "earn/modules/vault-details/hooks/usePageContext";
import Image from "next/image";

export const HeaderSection = () => {
  const {
    query: { isPending, data },
  } = usePageContext();

  return (
    <section className="flex flex-col px-4 md:px-20">
      <div className="mt-12">
        <ArrowDownIcon className="rotate-90 w-4 h-4" />
      </div>
      <div className="mt-16">
        <div className="flex items-center space-x-3">
          <Skeleton isLoading={isPending} className="rounded-full">
            {data?.vaultByAddress.asset.logoURI ? (
              <Image
                src={data.vaultByAddress.asset.logoURI}
                alt={data.vaultByAddress.asset.name}
                width={48}
                height={48}
                className="rounded-full shrink-0"
              />
            ) : (
              <div className="rounded-full shrink-0 w-12 h-12 bg-grey-dark" />
            )}
          </Skeleton>
          <Skeleton isLoading={isPending}>
            <span className="text-2xl/6">{data?.vaultByAddress.name}</span>
          </Skeleton>
        </div>
      </div>
    </section>
  );
};
