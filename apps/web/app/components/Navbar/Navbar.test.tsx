import { render, screen } from "@testing-library/react";
import type React from "react";

import Navbar from "./Navbar";

describe("Navbar Component", () => {
  test("renders company logo", () => {
    render(<Navbar />);
    const logoElem = screen.getByAltText(/logo/i);
    expect(logoElem).toBeInTheDocument();
  });

  test("renders navbar links", () => {
    render(<Navbar />);
    const bridgeLink = screen.getByText(/bridge/i);
    expect(bridgeLink).toBeInTheDocument();
    const swapLink = screen.getByText(/swap/i);
    expect(swapLink).toBeInTheDocument();
    const poolLink = screen.getByText(/pool/i);
    expect(poolLink).toBeInTheDocument();
  });
});
