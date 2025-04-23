import { BridgeHeaderSection } from "bridge/components/bridge-header-section";
import { ContentSection } from "./sections/content-section";

export const DepositPage = () => {
  return (
    <>
      <BridgeHeaderSection activeTab="deposit" />
      <ContentSection />
    </>
  );
};
