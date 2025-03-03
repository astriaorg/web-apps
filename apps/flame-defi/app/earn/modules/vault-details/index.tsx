import { PageContextProvider } from "earn/modules/vault-details/contexts/page-context";
import { ContentSection } from "earn/modules/vault-details/sections/content-section";
import { HeaderSection } from "earn/modules/vault-details/sections/header-section";

export const Page = () => {
  return (
    <PageContextProvider>
      <HeaderSection />
      <ContentSection />
    </PageContextProvider>
  );
};
