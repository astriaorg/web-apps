import { PageContextProvider } from "earn/pages/vault-list/contexts/page-context";
import { HeaderSection } from "earn/pages/vault-list/sections/header-section";
import { TableSection } from "earn/pages/vault-list/sections/table-section";

export const Page = () => {
  return (
    <PageContextProvider>
      <HeaderSection />
      <TableSection />
    </PageContextProvider>
  );
};
