import { PageContextProvider } from "pool/modules/create-position/contexts/page-context";
import { ContentSection } from "pool/modules/create-position/sections/content-section";
import { HeaderSection } from "pool/modules/create-position/sections/header-section";

export const Page = () => {
  return (
    <PageContextProvider>
      <HeaderSection />
      <ContentSection />
    </PageContextProvider>
  );
};
