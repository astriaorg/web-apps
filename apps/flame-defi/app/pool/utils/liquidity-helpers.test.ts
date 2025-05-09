import {
  getAmount0ForLiquidity,
  getAmount1ForLiquidity,
} from "./liquidity-helpers";

describe("getAmount0ForLiquidity", () => {
  it("should calculate correct amount", () => {
    let result = getAmount0ForLiquidity({
      amount1: "0.000001",
      price: 1,
      decimal0: 18,
    });

    // Test using values from legacy app TIA/USDC 0.01% pool (uninitialized).
    // Legacy app: 0.000000999996
    expect(result).toEqual("0.000000999950003750");

    result = getAmount0ForLiquidity({
      amount1: "0.000001",
      price: 2,
      decimal0: 18,
    });

    // Legacy app: 0.000000499989
    expect(result).toEqual("0.000000500015918128");
  });
});

describe("getAmount1ForLiquidity", () => {
  it("should calculate correct amount", () => {
    let result = getAmount1ForLiquidity({
      amount0: "1",
      price: 1,
      decimal1: 18,
    });

    // Legacy app: 1
    expect(result).toEqual("1.000049998750062486");

    result = getAmount1ForLiquidity({
      amount0: "1",
      price: 2,
      decimal1: 18,
    });

    // Legacy app: 2.00004
    expect(result).toEqual("1.999936329514114080");
  });
});
