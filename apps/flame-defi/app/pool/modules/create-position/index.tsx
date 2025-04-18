import { PageContextProvider } from "pool/modules/create-position/contexts/page-context";
import { ContentSection } from "pool/modules/create-position/sections/content-section";

export const Page = () => {
  return (
    <PageContextProvider>
      <ContentSection />
    </PageContextProvider>
  );
};
