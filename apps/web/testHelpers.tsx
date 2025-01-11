import { render } from "@testing-library/react";
import { ConfigContextProvider } from "config";
import type React from "react";

export const renderWithProviders = (element: React.JSX.Element) => {
  render(<ConfigContextProvider>{element}</ConfigContextProvider>);
};
