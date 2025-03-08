import { PageContextProvider } from "earn/modules/vault-list/contexts/page-context";
import { ContentSection } from "earn/modules/vault-list/sections/content-section";
import { HeaderSection } from "earn/modules/vault-list/sections/header-section";

export const Page = () => {
  return (
    <PageContextProvider>
      <HeaderSection />
      <ContentSection />
    </PageContextProvider>
  );
};
