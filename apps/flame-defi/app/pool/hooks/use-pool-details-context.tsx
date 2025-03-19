import { PoolDetailsContext } from "pool/context/pool-details-context";
import { useContext } from "react";

export const usePoolDetailsContext = () => {
  const context = useContext(PoolDetailsContext);

  if (context === undefined) {
    throw new Error(
      "`usePoolDetailsContext` must be used within a PoolDetailsContextProvider.",
    );
  }

  return context;
};
