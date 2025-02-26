import { createContext, useContext } from "react";

export const CardContext = createContext<{ isLoading: boolean } | undefined>(
  undefined,
);

export const useCardContext = () => {
  const context = useContext(CardContext);

  if (!context) {
    throw new Error("`useCardContext` must be used within a CardContext.");
  }

  return context;
};
