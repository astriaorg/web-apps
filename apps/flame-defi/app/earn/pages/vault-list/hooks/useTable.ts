import { TableContext } from "earn/pages/vault-list/contexts/table-context";
import { useContext } from "react";

export const useTable = () => {
  const context = useContext(TableContext);

  if (context === undefined) {
    throw new Error("`useTable` must be used within a TableContextProvider.");
  }

  return context;
};
