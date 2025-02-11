import {
  Table,
  TableCard,
  TablePagination,
  TableSearch,
} from "earn/components/Table";
import { useTable } from "earn/hooks/useTable";

export const TableSection = () => {
  const { status } = useTable();

  return (
    <section className="flex flex-col p-20">
      <div className="flex justify-end w-full mb-6">
        <TableSearch />
      </div>

      {status === "error" && (
        <TableCard className="h-[250px] text-lg text-grey-light flex items-center justify-center">
          {`We couldn't fetch vault data. Please try again later.`}
        </TableCard>
      )}
      {status === "empty" && (
        <TableCard className="h-[250px] text-lg text-grey-light flex items-center justify-center">
          {`No vaults found.`}
        </TableCard>
      )}
      {status === "success" && (
        <>
          <TableCard>
            <Table />
          </TableCard>

          <div className="flex justify-center mt-10">
            <TablePagination />
          </div>
        </>
      )}
    </section>
  );
};
