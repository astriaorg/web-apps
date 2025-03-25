import { PageContextProvider } from "earn/modules/market-list/contexts/page-context";
import { ContentSection } from "earn/modules/market-list/sections/content-section";
import { HeaderSection } from "earn/modules/market-list/sections/header-section";

export const Page = () => {
  return (
    <PageContextProvider>
      <HeaderSection />
      <ContentSection />
    </PageContextProvider>
  );
};
