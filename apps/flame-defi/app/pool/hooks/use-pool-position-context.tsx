import { PoolPositionContext } from "pool/context/pool-position-context";
import { useContext } from "react";

export const usePoolPositionContext = () => {
  const context = useContext(PoolPositionContext);

  if (context === undefined) {
    throw new Error(
      "`usePoolPositionContext` must be used within a PoolPositionContextProvider.",
    );
  }

  return context;
};
