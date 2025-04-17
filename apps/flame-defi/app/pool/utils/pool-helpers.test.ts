import Big from "big.js";
import { getPoolExchangeRate } from "./pool-helpers";

// Test our implementation against the values in the Uniswap V3 documentation example.
describe("getPoolExchangeRate", () => {
  it("should return correct exchange rate", () => {
    const token0 = {
      coinDenom: "USDC",
      coinDecimals: 6,
    } as any; // eslint-disable-line @typescript-eslint/no-explicit-any

    const token1 = {
      coinDenom: "WETH",
      coinDecimals: 18,
    } as any; // eslint-disable-line @typescript-eslint/no-explicit-any

    const result = getPoolExchangeRate({
      token0,
      token1,
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
      new Big(result.rateToken0ToToken1).toFixed(token1.coinDecimals),
    ).toEqual("0.000649004842701370"); // 1 USDC = _ WETH
    expect(
      new Big(result.rateToken1ToToken0).toFixed(token0.coinDecimals),
    ).toEqual("1540.820552"); // 1 WETH = _ USDC
  });
});
