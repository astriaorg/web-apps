import { useContext } from "react";

import { PoolContext } from "pool/context/pool-context";

export const usePoolContext = () => {
  const context = useContext(PoolContext);

  if (context === undefined) {
    throw new Error(
      "`usePoolContext` must be used within a PoolContextProvider.",
    );
  }

  return context;
};
