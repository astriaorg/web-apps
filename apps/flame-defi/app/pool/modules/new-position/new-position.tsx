import { PoolPositionContextProvider } from "pool/context/pool-position-context";
import { ContentSection } from "./sections/content-section";
import { HeaderSection } from "./sections/header-section";

export const NewPosition = () => {
  return (
    <PoolPositionContextProvider>
      <div className="flex flex-col">
        <HeaderSection />
        <ContentSection />
      </div>
    </PoolPositionContextProvider>
  );
};
