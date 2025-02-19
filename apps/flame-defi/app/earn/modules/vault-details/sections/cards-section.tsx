import { Card } from "earn/components/card";
import { SummaryCards } from "earn/modules/vault-details/components/summary-cards";
import { usePageContext } from "earn/modules/vault-details/hooks/usePageContext";

export const CardsSection = () => {
  const {
    query: { isPending, data },
  } = usePageContext();

  return (
    <section className="flex flex-col px-4 md:px-20">
      <div className="grid grid-cols-3 gap-4 mt-12">
        <SummaryCards />
        <div>
          <Card></Card>
        </div>
      </div>
    </section>
  );
};
