import { DepositPageContextProvider } from "./contexts/deposit-page-context";
import { ContentSection } from "./sections/content-section";
import { HeaderSection } from "./sections/header-section";

export const DepositPage = () => {
  return (
    <DepositPageContextProvider>
      <HeaderSection />
      <ContentSection />
    </DepositPageContextProvider>
  );
};
