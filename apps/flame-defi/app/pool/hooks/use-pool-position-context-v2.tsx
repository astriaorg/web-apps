import { useContext } from "react";

import { PoolPositionContext } from "pool/context/pool-position-context-v2";

export const usePoolPositionContext = () => {
  const context = useContext(PoolPositionContext);

  if (context === undefined) {
    throw new Error(
      "`usePoolPositionContext` must be used within a PoolPositionContextProvider.",
    );
  }

  return context;
};
