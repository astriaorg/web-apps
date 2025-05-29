import { PoolPositionContextProvider as PoolPositionContextProviderV2 } from "pool/context/pool-position-context";
import { ContentSection } from "pool/modules/add-liquidity/sections/content-section";
import { HeaderSection } from "pool/modules/add-liquidity/sections/header-section";

export const Page = () => {
  return (
    <PoolPositionContextProviderV2>
      <HeaderSection />
      <ContentSection />
    </PoolPositionContextProviderV2>
  );
};
