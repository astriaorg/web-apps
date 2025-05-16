import { PoolPositionContextProvider } from "pool/context/pool-position-context";
import { PoolPositionContextProvider as PoolPositionContextProviderV2 } from "pool/context/pool-position-context-v2";

import { ContentSection } from "./sections/content-section";
import { HeaderSection } from "./sections/header-section";

export const Page = () => {
  return (
    <PoolPositionContextProvider>
      <PoolPositionContextProviderV2>
        <HeaderSection />
        <ContentSection />
      </PoolPositionContextProviderV2>
    </PoolPositionContextProvider>
  );
};
