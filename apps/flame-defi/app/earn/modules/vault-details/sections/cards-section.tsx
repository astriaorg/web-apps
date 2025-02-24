import { Skeleton } from "@repo/ui/components";
import { APYChart } from "earn/modules/vault-details/components/apy-chart";
import { SummaryCards } from "earn/modules/vault-details/components/summary-cards";
import { usePageContext } from "earn/modules/vault-details/hooks/use-page-context";

export const CardsSection = () => {
  const {
    query: { isPending },
  } = usePageContext();

  return (
    <section className="flex flex-col px-4 md:px-20">
      <div className="mt-12">
        <SummaryCards />
        <div className="mt-10 flex flex-col space-y-4">
          <Skeleton isLoading={isPending} className="w-24">
            <span className="text-base/4 font-semibold">Overview</span>
          </Skeleton>
          <APYChart />
        </div>
      </div>
    </section>
  );
};
