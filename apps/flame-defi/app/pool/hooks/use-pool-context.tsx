import { PoolContext } from "pool/context/pool-context";
import { useContext } from "react";

export const usePoolContext = () => {
  const context = useContext(PoolContext);

  if (context === undefined) {
    throw new Error(
      "`usePoolContext` must be used within a PoolContextProvider.",
    );
  }

  return context;
};
