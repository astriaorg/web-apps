import { PageContextProvider } from "earn/modules/vault-details/contexts/page-context";
import { HeaderSection } from "earn/modules/vault-details/sections/header-section";

export const Page = () => {
  return (
    <PageContextProvider>
      <HeaderSection />
    </PageContextProvider>
  );
};
