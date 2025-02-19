import { createContext, useContext } from "react";

export const SummaryCardContext = createContext<
  { isLoading: boolean } | undefined
>(undefined);

export const useSummaryCardContext = () => {
  const context = useContext(SummaryCardContext);

  if (!context) {
    throw new Error(
      "`useSummaryCardContext` must be used within a SummaryCardContext.",
    );
  }

  return context;
};
