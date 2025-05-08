import Big from "big.js";

import { TICK_BOUNDARIES } from "pool/types";

import {
  calculateNearestValidTick,
  calculatePoolExchangeRate,
  calculatePriceToTick,
  calculateTickToPrice,
  getAmount0ForLiquidity,
  getAmount1ForLiquidity,
} from "./pool-helpers";

// Test our implementation against the values in the Uniswap V3 documentation example.
describe("calculatePoolExchangeRate", () => {
  // price = token1/token0 = WETH/USDC
  const TOKEN_0 = {
    coinDenom: "USDC",
    coinDecimals: 6,
  };
  const TOKEN_1 = {
    coinDenom: "WETH",
    coinDecimals: 18,
  };

  it("should return correct exchange rate", () => {
    const result = calculatePoolExchangeRate({
      decimal0: TOKEN_0.coinDecimals,
      decimal1: TOKEN_1.coinDecimals,
      sqrtPriceX96: 2018382873588440326581633304624437n,
    });

    expect(
      new Big(result.rateToken0ToToken1).toFixed(TOKEN_1.coinDecimals),
    ).toEqual("0.000649004842701370"); // 1 USDC = _ WETH
    expect(
      new Big(result.rateToken1ToToken0).toFixed(TOKEN_0.coinDecimals),
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
  const TOKEN_0 = {
    coinDenom: "WETH",
    coinDecimals: 18,
  };
  const TOKEN_1 = {
    coinDenom: "USDC",
    coinDecimals: 6,
  };

  // Values from Uniswap V3 example.
  const TICK_LOWER = 202910;
  const TICK_UPPER = 202920;
  const PRICE_LOWER = 648378713.2500573;
  const PRICE_UPPER = 649027383.8115474;
  const INVERSE_DECIMAL_ADJUSTED_PRICE_LOWER = "1542.30";
  const INVERSE_DECIMAL_ADJUSTED_PRICE_UPPER = "1540.76";

  it("calculateTickToPrice", () => {
    const priceLower = calculateTickToPrice({ tick: TICK_LOWER });
    const priceUpper = calculateTickToPrice({ tick: TICK_UPPER });

    expect(priceLower).toEqual(PRICE_LOWER);
    expect(priceUpper).toEqual(PRICE_UPPER);

    const decimalAdjustedPriceLower = calculateTickToPrice({
      tick: TICK_LOWER,
      decimal0: TOKEN_0.coinDecimals,
      decimal1: TOKEN_1.coinDecimals,
    });
    const decimalAdjustedPriceUpper = calculateTickToPrice({
      tick: TICK_UPPER,
      decimal0: TOKEN_0.coinDecimals,
      decimal1: TOKEN_1.coinDecimals,
    });

    // Example has values truncated to 2 decimal places.
    expect(new Big(1 / decimalAdjustedPriceLower).toFixed(2, 0)).toEqual(
      INVERSE_DECIMAL_ADJUSTED_PRICE_LOWER,
    );
    expect(new Big(1 / decimalAdjustedPriceUpper).toFixed(2, 0)).toEqual(
      INVERSE_DECIMAL_ADJUSTED_PRICE_UPPER,
    );
  });

  it("calculatePriceToTick", () => {
    const priceLower = 1 / Number(INVERSE_DECIMAL_ADJUSTED_PRICE_LOWER);
    const priceUpper = 1 / Number(INVERSE_DECIMAL_ADJUSTED_PRICE_UPPER);

    const tickLower = calculatePriceToTick({
      price: priceLower,
      decimal0: TOKEN_0.coinDecimals,
      decimal1: TOKEN_1.coinDecimals,
    });
    const tickUpper = calculatePriceToTick({
      price: priceUpper,
      decimal0: TOKEN_0.coinDecimals,
      decimal1: TOKEN_1.coinDecimals,
    });

    expect(tickLower).toEqual(TICK_LOWER);
    expect(tickUpper).toEqual(TICK_UPPER);

    const decimalAdjustedTickLower = calculatePriceToTick({
      price: priceLower,
      decimal0: TOKEN_0.coinDecimals,
      decimal1: TOKEN_1.coinDecimals,
    });
    const decimalAdjustedTickUpper = calculatePriceToTick({
      price: priceUpper,
      decimal0: TOKEN_0.coinDecimals,
      decimal1: TOKEN_1.coinDecimals,
    });

    expect(decimalAdjustedTickLower).toEqual(TICK_LOWER);
    expect(decimalAdjustedTickUpper).toEqual(TICK_UPPER);
  });
});

describe("calculateNearestValidTick", () => {
  const TICK_SPACING = 60;

  it("should calculate nearest valid tick for tickLower (min)", () => {
    const nearestTickLower = calculateNearestValidTick({
      tick: TICK_BOUNDARIES.MIN,
      tickSpacing: TICK_SPACING,
    });

    expect(nearestTickLower).toEqual(-887220);
  });

  it("should calculate nearest valid tick for tickUpper (max)", () => {
    const nearestTickUpper = calculateNearestValidTick({
      tick: TICK_BOUNDARIES.MAX,
      tickSpacing: TICK_SPACING,
    });

    expect(nearestTickUpper).toEqual(887220);
  });
});

describe("getAmount0ForLiquidity", () => {
  it("should calculate correct derived amount", () => {
    let result = getAmount0ForLiquidity({
      amount1: "0.000001",
      price: 1,
      decimal0: 18,
    });

    // Test using values from legacy app TIA/USDC 0.01% pool (uninitialized).
    // Legacy app: 0.000000999996
    expect(result).toEqual("0.000000999950003749");

    result = getAmount0ForLiquidity({
      amount1: "0.000001",
      price: 2,
      decimal0: 18,
    });

    // Legacy app: 0.000000499989
    expect(result).toEqual("0.000000499995459580");
  });
});

describe("getAmount1ForLiquidity", () => {
  it("should calculate correct derived amount", () => {
    let result = getAmount1ForLiquidity({
      amount0: "1",
      price: 1,
      decimal1: 18,
    });

    // Legacy app: 1
    expect(result).toEqual("1.000049998751066095");

    result = getAmount1ForLiquidity({
      amount0: "1",
      price: 2,
      decimal1: 18,
    });

    // Legacy app: 2.00004
    expect(result).toEqual("2.000018161846137105");
  });
});
