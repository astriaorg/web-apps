import { PageContextProvider } from "earn/modules/market-details/contexts/page-context";
import { ContentSection } from "earn/modules/market-details/sections/content-section";
import { HeaderSection } from "earn/modules/market-details/sections/header-section";

export const Page = () => {
  return (
    <PageContextProvider>
      <HeaderSection />
      <ContentSection />
    </PageContextProvider>
  );
};
