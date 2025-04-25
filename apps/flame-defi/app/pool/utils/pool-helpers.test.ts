import Big from "big.js";
import {
  calculatePoolExchangeRate,
  calculateTickToPrice,
} from "./pool-helpers";

// Test our implementation against the values in the Uniswap V3 documentation example.
describe("calculatePoolExchangeRate", () => {
  // price = token1/token0 = WETH/USDC
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

describe("calculatePriceToTick and calculateTickToPrice", () => {
  // USDC/WETH
  const token0 = {
    coinDenom: "WETH",
    coinDecimals: 18,
  };
  const token1 = {
    coinDenom: "USDC",
    coinDecimals: 6,
  };

  it("calculateTickToPrice", () => {
    const tickLower = 202910;
    const tickUpper = 202920;

    const priceLower = calculateTickToPrice({ tick: tickLower });
    const priceUpper = calculateTickToPrice({ tick: tickUpper });

    expect(priceLower).toEqual(648378713.2500573);
    expect(priceUpper).toEqual(649027383.8115474);

    const decimalAdjustedPriceLower = calculateTickToPrice({
      tick: tickLower,
      decimal0: token0.coinDecimals,
      decimal1: token1.coinDecimals,
    });
    const decimalAdjustedPriceUpper = calculateTickToPrice({
      tick: tickUpper,
      decimal0: token0.coinDecimals,
      decimal1: token1.coinDecimals,
    });

    // Example has values truncated to 2 decimal places.
    expect(new Big(1 / decimalAdjustedPriceLower).toFixed(2, 0)).toEqual(
      "1542.30",
    );
    expect(new Big(1 / decimalAdjustedPriceUpper).toFixed(2, 0)).toEqual(
      "1540.76",
    );
  });
});
