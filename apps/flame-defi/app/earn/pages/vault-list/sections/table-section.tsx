import { Card } from "earn/components/card";
import {
  Table,
  TablePagination,
  TableSearch,
} from "earn/pages/vault-list/components/table";
import { useTable } from "earn/pages/vault-list/hooks/useTable";

export const TableSection = () => {
  const { status } = useTable();

  return (
    <section className="flex flex-col px-4 md:px-20">
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
