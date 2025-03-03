import { PageContextProvider } from "earn/modules/vault-list/contexts/page-context";
import { HeaderSection } from "earn/modules/vault-list/sections/header-section";
import { TableSection } from "earn/modules/vault-list/sections/table-section";

export const Page = () => {
  return (
    <PageContextProvider>
      <HeaderSection />
      <TableSection />
    </PageContextProvider>
  );
};
