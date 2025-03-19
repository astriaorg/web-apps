import { HeaderSection } from "./sections/header-section";
import { ContentSection } from "./sections/content-section";
import { PoolDetailsContextProvider } from "pool/context/pool-details-context";

export const AddLiquidity = () => {
  return (
    <PoolDetailsContextProvider>
      <div className="flex flex-col">
        <HeaderSection />
        <ContentSection />
      </div>
    </PoolDetailsContextProvider>
  );
};
