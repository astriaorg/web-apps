import { TableContext } from "earn/contexts/TableContext";
import { useContext } from "react";

export const useTable = () => {
  const context = useContext(TableContext);

  if (context === undefined) {
    throw new Error("`useTable` must be used within a TableContextProvider.");
  }

  return context;
};
