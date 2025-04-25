import Big from "big.js";
import { calculatePoolExchangeRate } from "./pool-helpers";

// Test our implementation against the values in the Uniswap V3 documentation example.
describe("calculatePoolExchangeRate", () => {
  const token0 = {
    coinDenom: "USDC",
    coinDecimals: 6,
  };

  const token1 = {
    coinDenom: "WETH",
    coinDecimals: 18,
  };

  it("should return correct exchange rate", () => {
    const result = calculatePoolExchangeRate({
      decimal0: token0.coinDecimals,
      decimal1: token1.coinDecimals,
      sqrtPriceX96: 2018382873588440326581633304624437n,
    });

    expect(
      new Big(result.rateToken0ToToken1).toFixed(token1.coinDecimals),
    ).toEqual("0.000649004842701370"); // 1 USDC = _ WETH
    expect(
      new Big(result.rateToken1ToToken0).toFixed(token0.coinDecimals),
    ).toEqual("1540.820552"); // 1 WETH = _ USDC
  });

  it("should handle decimal0 > decimal1", () => {
    const result = calculatePoolExchangeRate({
      decimal0: 18,
      decimal1: 6,
      sqrtPriceX96: 47889311123928123387139217653477427n,
    });

    expect(result.rateToken0ToToken1).toEqual("0.36535748767549793233");
    expect(result.rateToken1ToToken0).toEqual("2.73704531515767610072");
  });
});
