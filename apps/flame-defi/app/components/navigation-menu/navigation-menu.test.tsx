import { screen } from "@testing-library/react";

import { renderWithProviders } from "testing/helpers";

import { NavigationMenu } from "./navigation-menu";

// Mock the usePathname hook from Next.js
jest.mock("next/navigation", () => ({
  usePathname: jest.fn().mockReturnValue("/"),
}));

describe("`NavigationMenu` Component", () => {
  test("renders company logo", () => {
    renderWithProviders(<NavigationMenu />);
    const logoElem = screen.getByLabelText("Astria Logo");
    expect(logoElem).toBeInTheDocument();
  });

  test("renders navigation menu links", () => {
    renderWithProviders(<NavigationMenu />);
    const bridgeLink = screen.getByText(/bridge/i);
    expect(bridgeLink).toBeInTheDocument();
    const swapLink = screen.getByText(/swap/i);
    expect(swapLink).toBeInTheDocument();
    const poolLink = screen.getByText(/pool/i);
    expect(poolLink).toBeInTheDocument();
    const earnLink = screen.getByText(/earn/i);
    expect(earnLink).toBeInTheDocument();
    const borrowLink = screen.getByText(/borrow/i);
    expect(borrowLink).toBeInTheDocument();
  });
});
