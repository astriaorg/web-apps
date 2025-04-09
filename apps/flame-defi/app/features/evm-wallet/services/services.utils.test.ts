import { needToReverseTokenOrder } from "./services.utils";

describe("needToReverseTokenOrder", () => {
  it("should return true when token0 has higher address", () => {
    expect(
      needToReverseTokenOrder(
        "0xBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB",
        "0xAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
      ),
    ).toBe(true);
  });

  it("should return false when token0 has lower address", () => {
    expect(
      needToReverseTokenOrder(
        "0xAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
        "0xBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB",
      ),
    ).toBe(false);
  });

  it("should handle case insensitive comparison", () => {
    expect(
      needToReverseTokenOrder(
        "0xAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
        "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
      ),
    ).toBe(false);
  });

  it("should handle same address", () => {
    expect(
      needToReverseTokenOrder(
        "0xAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
        "0xAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
      ),
    ).toBe(false);
  });
});
