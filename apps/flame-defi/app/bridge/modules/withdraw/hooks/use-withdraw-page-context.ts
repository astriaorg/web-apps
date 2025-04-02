import { useContext } from "react";
import { WithdrawPageContext } from "../contexts/withdraw-page-context";

export const useWithdrawPageContext = () => {
  const context = useContext(WithdrawPageContext);
  if (context === undefined) {
    throw new Error("usePageContext must be used within a PageContextProvider");
  }
  return context;
};
