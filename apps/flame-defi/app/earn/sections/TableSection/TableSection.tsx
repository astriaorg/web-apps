import { Card } from "earn/components/Card";
import { MarketSummary } from "earn/components/MarketSummary";
import { Table, TablePagination, TableSearch } from "earn/components/Table";
import { useTable } from "earn/hooks/useTable";

export const TableSection = () => {
  const { status } = useTable();

  return (
    <section className="flex flex-col p-4 md:p-20">
      <div className="flex flex-col justify-between gap-4 mt-20 mb-6 md:flex-row md:mb-4 md:mt-0">
        <h1 className="text-xl/6">Lend</h1>
        <MarketSummary />
      </div>

      <div className="flex w-full mb-4">
        <TableSearch />
      </div>

      {status === "error" && (
        <Card className="h-[250px] text-lg text-grey-light flex items-center justify-center">
          {`We couldn't fetch vault data. Please try again later.`}
        </Card>
      )}
      {status === "empty" && (
        <Card className="h-[250px] text-lg text-grey-light flex items-center justify-center">
          {`No vaults found.`}
        </Card>
      )}
      {status === "success" && (
        <>
          <Card className="overflow-x-hidden md:overflow-x-auto">
            <Table />
          </Card>

          <div className="flex justify-center mt-10">
            <TablePagination />
          </div>
        </>
      )}
    </section>
  );
};
