import { APYChart } from "earn/modules/vault-details/components/apy-chart";
import { SummaryCards } from "earn/modules/vault-details/components/summary-cards";

export const CardsSection = () => {
  return (
    <section className="flex flex-col px-4 md:px-20">
      <div className="mt-12">
        <SummaryCards />
        <div className="mt-10 flex flex-col space-y-4">
          <span className="text-base/4 font-semibold">Overview</span>
          <APYChart />
        </div>
      </div>
    </section>
  );
};
