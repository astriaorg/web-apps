import { useContext } from "react";

import { PageContext } from "pool/modules/position-list/contexts/page-context";

export const usePageContext = () => {
  const context = useContext(PageContext);

  if (context === undefined) {
    throw new Error(
      "`usePageContext` must be used within a PageContextProvider.",
    );
  }

  return context;
};
