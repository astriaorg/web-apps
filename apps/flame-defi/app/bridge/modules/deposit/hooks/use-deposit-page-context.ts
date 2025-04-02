import { useContext } from "react";
import { DepositPageContext } from "../contexts/deposit-page-context";

export const useDepositPageContext = () => {
  const context = useContext(DepositPageContext);
  if (context === undefined) {
    throw new Error(
      "useDepositPageContext must be used within a DepositPageContext",
    );
  }
  return context;
};
