import { PageContextProvider } from "earn/modules/market-details/contexts/page-context";
import { HeaderSection } from "earn/modules/market-details/header-section";

export const Page = () => {
  return (
    <PageContextProvider>
      <HeaderSection />
    </PageContextProvider>
  );
};
