import { APYChart } from "earn/modules/vault-details/components/apy-chart";
import { SummaryCards } from "earn/modules/vault-details/components/summary-cards";
import { usePageContext } from "earn/modules/vault-details/hooks/usePageContext";

export const CardsSection = () => {
  const {
    query: { isPending, data },
  } = usePageContext();

  return (
    <section className="flex flex-col px-4 md:px-20">
      <div className="mt-12">
        <SummaryCards />
        <div className="mt-10">
          <span className="text-base/4 font-semibold">Overview</span>
          <APYChart />
        </div>
      </div>
    </section>
  );
};
