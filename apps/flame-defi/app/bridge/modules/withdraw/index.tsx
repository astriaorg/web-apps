import { WithdrawPageContextProvider } from "./contexts/withdraw-page-context";
import { ContentSection } from "./sections/content-section";
import { HeaderSection } from "./sections/header-section";

export const WithdrawPage = () => {
  return (
    <WithdrawPageContextProvider>
      <HeaderSection />
      <ContentSection />
    </WithdrawPageContextProvider>
  );
};
