import { screen } from "@testing-library/react";
import { renderWithProviders } from "testing/helpers";
import Navbar from "./navbar";

// Mock the usePathname hook from Next.js
jest.mock("next/navigation", () => ({
  usePathname: jest.fn().mockReturnValue("/"),
}));

describe("Navbar Component", () => {
  test("renders company logo", () => {
    renderWithProviders(<Navbar />);
    const logoElem = screen.getByAltText(/logo/i);
    expect(logoElem).toBeInTheDocument();
  });

  test("renders navbar links", () => {
    renderWithProviders(<Navbar />);
    const bridgeLink = screen.getByText(/bridge/i);
    expect(bridgeLink).toBeInTheDocument();
    const swapLink = screen.getByText(/swap/i);
    expect(swapLink).toBeInTheDocument();
    const poolLink = screen.getByText(/pool/i);
    expect(poolLink).toBeInTheDocument();
    const earnLink = screen.getByText(/earn/i);
    expect(earnLink).toBeInTheDocument();
  });
});
