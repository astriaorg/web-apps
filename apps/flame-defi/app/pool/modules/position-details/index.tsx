import { PoolPositionContextProvider } from "pool/context/pool-position-context";

import { ContentSection } from "./sections/content-section";
import { HeaderSection } from "./sections/header-section";

export const Page = () => {
  return (
    <PoolPositionContextProvider>
      <HeaderSection />
      <ContentSection />
    </PoolPositionContextProvider>
  );
};
