import { PoolContextProvider } from "pool/context/pool-context";
import { ContentSection } from "./sections/content-section";
import { HeaderSection } from "./sections/header-section";

export const NewPosition = () => {
  return (
    <PoolContextProvider>
      <div className="flex flex-col">
        <HeaderSection />
        <ContentSection />
      </div>
    </PoolContextProvider>
  );
};
