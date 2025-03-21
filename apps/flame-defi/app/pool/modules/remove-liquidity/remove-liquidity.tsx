import { HeaderSection } from "./sections/header-section";
import { ContentSection } from "./sections/content-section";
import { PoolPositionContextProvider } from "pool/context/pool-position-context";

export const RemoveLiquidity = () => {
  return (
    <PoolPositionContextProvider>
      <div className="flex flex-col">
        <HeaderSection />
        <ContentSection />
      </div>
    </PoolPositionContextProvider>
  );
};
