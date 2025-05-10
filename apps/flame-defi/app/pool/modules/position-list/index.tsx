import { PageContextProvider } from "pool/modules/position-list/contexts/page-context";
// import { ContentSection } from "pool/modules/position-list/sections/content-section";
import { HeaderSection } from "pool/modules/position-list/sections/header-section";

export const Page = () => {
  return (
    <PageContextProvider>
      <HeaderSection />
      {/* <ContentSection /> */}
    </PageContextProvider>
  );
};
