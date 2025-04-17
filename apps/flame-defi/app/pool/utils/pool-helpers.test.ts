import { getPoolExchangeRate } from "./pool-helpers";

// Test our implementation against the values in the Uniswap V3 documentation example.
describe("getPoolExchangeRate", () => {
  it("should return correct exchange rate", () => {
    const token0 = {
      coinDenom: "USDC",
      coinDecimals: 6,
    } as any;

    const token1 = {
      coinDenom: "WETH",
      coinDecimals: 18,
    } as any;

    const result = getPoolExchangeRate({
      token0,
      token1,
      slot0: {
        sqrtPriceX96: BigInt("2018382873588440326581633304624437"),
        tick: 0,
        observationIndex: 0,
        observationCardinality: 0,
        observationCardinalityNext: 0,
        feeProtocol: 0,
        unlocked: true,
      },
    });

    expect(result.token0ToToken1).toEqual("1540.820552");
    expect(result.token1ToToken0).toEqual("0.000649004842701370");
  });
});
