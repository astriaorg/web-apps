import { TableContextProvider } from "earn/pages/vault-list/contexts/table-context";
import { TableSection } from "earn/pages/vault-list/sections/table-section";
import { HeaderSection } from "./sections/header-section";

export const VaultListPage = () => {
  return (
    <TableContextProvider>
      <HeaderSection />
      <TableSection />
    </TableContextProvider>
  );
};
