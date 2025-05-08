import { render } from "@testing-library/react";
import type React from "react";

import { ConfigContextProvider } from "config";

export const renderWithProviders = (element: React.JSX.Element) => {
  render(<ConfigContextProvider>{element}</ConfigContextProvider>);
};
