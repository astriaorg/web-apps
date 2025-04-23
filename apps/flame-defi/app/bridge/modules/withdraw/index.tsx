import { BridgeHeaderSection } from "bridge/components/bridge-header-section";
import { ContentSection } from "./sections/content-section";

export const WithdrawPage = () => {
  return (
    <>
      <BridgeHeaderSection activeTab="withdraw" />
      <ContentSection />
    </>
  );
};
