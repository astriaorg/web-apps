import Big from "big.js";
import {
  calculatePoolExchangeRate,
  calculateTickToPrice,
} from "./pool-helpers";

const TOKEN_0 = {
  coinDenom: "USDC",
  coinDecimals: 6,
};

const TOKEN_1 = {
  coinDenom: "WETH",
  coinDecimals: 18,
};

// Test our implementation against the values in the Uniswap V3 documentation example.
describe("calculatePoolExchangeRate", () => {
  it("should return correct exchange rate", () => {
    const result = calculatePoolExchangeRate({
      decimal0: TOKEN_0.coinDecimals,
      decimal1: TOKEN_1.coinDecimals,
      slot0: {
        sqrtPriceX96: 2018382873588440326581633304624437n,
        tick: 0,
        observationIndex: 0,
        observationCardinality: 0,
        observationCardinalityNext: 0,
        feeProtocol: 0,
        unlocked: true,
      },
    });

    expect(
      new Big(result.rateToken0ToToken1).toFixed(TOKEN_1.coinDecimals),
    ).toEqual("0.000649004842701370"); // 1 USDC = _ WETH
    expect(
      new Big(result.rateToken1ToToken0).toFixed(TOKEN_0.coinDecimals),
    ).toEqual("1540.820552"); // 1 WETH = _ USDC
  });
});

describe("calculateTickToPrice", () => {
  it("should return correct price", () => {
    const result = calculateTickToPrice({
      decimal0: TOKEN_0.coinDecimals,
      decimal1: TOKEN_1.coinDecimals,
      tick: 267967,
    });

    expect(result.priceToken0ToToken1).toEqual(0.43358784516599413);
    expect(result.priceToken1ToToken0).toEqual(2.306337714834145);
  });
});
