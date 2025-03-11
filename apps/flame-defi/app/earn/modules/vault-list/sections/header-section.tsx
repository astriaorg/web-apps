import { MarketSummary } from "earn/modules/vault-list/components/market-summary";

export const HeaderSection = () => {
  return (
    <section className="flex flex-col px-4 md:px-20 md:h-52">
      <div className="flex flex-col justify-between gap-4 mt-20 mb-6 md:flex-row md:mb-4">
        <h1 className="text-3xl/8 font-medium">Earn</h1>
        <MarketSummary />
      </div>
    </section>
  );
};
