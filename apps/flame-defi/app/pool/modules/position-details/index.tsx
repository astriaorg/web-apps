import { PoolPositionContextProvider as PoolPositionContextProviderV2 } from "pool/context/pool-position-context-v2";
import { ContentSection } from "pool/modules/position-details/sections/content-section";
import { HeaderSection } from "pool/modules/position-details/sections/header-section";

export const Page = () => {
  return (
    <PoolPositionContextProviderV2>
      <HeaderSection />
      <ContentSection />
    </PoolPositionContextProviderV2>
  );
};
