import { render, screen } from "@testing-library/react";
import type React from "react";
import { renderWithProviders } from "testing/helpers";

import { useConfig } from "config/hooks/use-config";

const TestComponent: React.FC = () => {
  const config = useConfig();
  return <div>{JSON.stringify(config)}</div>;
};

describe("ConfigContextProvider", () => {
  it("provides the correct config values", () => {
    renderWithProviders(<TestComponent />);

    const configString = screen.getByText(
      // this string in the mainnet configs, which are used by default
      /astria13vptdafyttpmlwppt0s844efey2cpc0mevy92p/,
    );
    expect(configString).toBeInTheDocument();
    expect(configString).toHaveTextContent("Celestia");
  });

  it("throws an error when useConfig is used outside of ConfigContextProvider", () => {
    // this blocks the console.error output so the test output is clean
    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});
    expect(() => render(<TestComponent />)).toThrow(
      "useConfig must be used within a ConfigContextProvider",
    );
    consoleErrorSpy.mockRestore();
  });
});
