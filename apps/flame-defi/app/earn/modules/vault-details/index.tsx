import { PageContextProvider } from "earn/modules/vault-details/contexts/page-context";
import { CardsSection } from "earn/modules/vault-details/sections/cards-section";
import { HeaderSection } from "earn/modules/vault-details/sections/header-section";

export const Page = () => {
  return (
    <PageContextProvider>
      <HeaderSection />
      <CardsSection />
    </PageContextProvider>
  );
};
