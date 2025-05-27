import { PoolPositionContextProvider as PoolPositionContextProviderV2 } from "pool/context/pool-position-context";
import { ContentSection } from "pool/modules/remove-liquidity/sections/content-section";
import { HeaderSection } from "pool/modules/remove-liquidity/sections/header-section";

export const Page = () => {
  return (
    <PoolPositionContextProviderV2>
      <HeaderSection />
      <ContentSection />
    </PoolPositionContextProviderV2>
  );
};
