import {
  needToReverseTokenOrder,
  calculateMinAmountWithSlippage,
  getOrderedTokenAmounts,
} from "./token-order-helpers";

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

describe("calculateMinAmountWithSlippage", () => {
  it("should apply slippage correctly", () => {
    // 100 tokens with 5% slippage = 95 min amount
    expect(calculateMinAmountWithSlippage("100", 5, 18)).toBe(
      95000000000000000000n,
    );
  });

  it("should handle 0% slippage", () => {
    expect(calculateMinAmountWithSlippage("100", 0, 18)).toBe(
      100000000000000000000n,
    );
  });

  it("should handle different decimals", () => {
    expect(calculateMinAmountWithSlippage("100", 5, 6)).toBe(95000000n);
  });

  it("should handle empty string", () => {
    expect(calculateMinAmountWithSlippage("", 5, 18)).toBe(0n);
  });

  it("should handle non-numeric string", () => {
    expect(calculateMinAmountWithSlippage("abc", 5, 18)).toBe(0n);
  });

  it("should handle different slippage percentages", () => {
    expect(calculateMinAmountWithSlippage("100", 1, 18)).toBe(
      99000000000000000000n,
    );
    expect(calculateMinAmountWithSlippage("100", 10, 18)).toBe(
      90000000000000000000n,
    );
  });
});

describe("getOrderedTokenAmounts", () => {
  it("should maintain order when tokens are already in correct order", () => {
    const result = getOrderedTokenAmounts(
      "100",
      "200",
      "0xAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
      "0xBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB",
      18,
      18,
      5,
    );

    expect(result.amount0Desired).toBe(100000000000000000000n);
    expect(result.amount1Desired).toBe(200000000000000000000n);
    expect(result.amount0Min).toBe(95000000000000000000n);
    expect(result.amount1Min).toBe(190000000000000000000n);
  });

  it("should swap order when tokens need to be reversed", () => {
    const result = getOrderedTokenAmounts(
      "100",
      "200",
      "0xBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB",
      "0xAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
      18,
      18,
      5,
    );

    expect(result.amount0Desired).toBe(200000000000000000000n);
    expect(result.amount1Desired).toBe(100000000000000000000n);
    expect(result.amount0Min).toBe(190000000000000000000n);
    expect(result.amount1Min).toBe(95000000000000000000n);
  });

  it("should handle different token decimals", () => {
    const result = getOrderedTokenAmounts(
      "100",
      "200",
      "0xAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
      "0xBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB",
      18,
      6,
      5,
    );

    expect(result.amount0Desired).toBe(100000000000000000000n);
    expect(result.amount1Desired).toBe(200000000n);
    expect(result.amount0Min).toBe(95000000000000000000n);
    expect(result.amount1Min).toBe(190000000n);
  });

  it("should handle different token decimals when order is reversed", () => {
    const result = getOrderedTokenAmounts(
      "100",
      "200",
      "0xBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB",
      "0xAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
      18,
      6,
      5,
    );

    expect(result.amount0Desired).toBe(200000000n);
    expect(result.amount1Desired).toBe(100000000000000000000n);
    expect(result.amount0Min).toBe(190000000n);
    expect(result.amount1Min).toBe(95000000000000000000n);
  });

  it("should handle different slippage values", () => {
    const result = getOrderedTokenAmounts(
      "100",
      "200",
      "0xAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
      "0xBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB",
      18,
      18,
      10,
    );

    expect(result.amount0Min).toBe(90000000000000000000n);
    expect(result.amount1Min).toBe(180000000000000000000n);
  });
});
