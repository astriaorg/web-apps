import { TableContextProvider } from "earn/pages/vault-list/contexts/table-context";
import { HeaderSection } from "earn/pages/vault-list/sections/header-section";
import { TableSection } from "earn/pages/vault-list/sections/table-section";

export const Page = () => {
  return (
    <TableContextProvider>
      <HeaderSection />
      <TableSection />
    </TableContextProvider>
  );
};
