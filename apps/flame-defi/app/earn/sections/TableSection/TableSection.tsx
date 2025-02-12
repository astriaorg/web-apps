import { Card } from "earn/components/Card";
import { Table, TablePagination, TableSearch } from "earn/components/Table";
import { useTable } from "earn/hooks/useTable";

export const TableSection = () => {
  const { status } = useTable();

  return (
    <section className="flex flex-col p-4 md:p-20">
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
