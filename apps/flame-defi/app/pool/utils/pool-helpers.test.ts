import Big from "big.js";
import { getChainConfigs } from "config";

import { type AstriaChain, EvmCurrency, FlameNetwork } from "@repo/flame-types";
import { TICK_BOUNDARIES } from "pool/types";

import {
  calculateNearestValidTick,
  calculateNewPoolPrices,
  calculatePriceToTick,
  calculateTickToPrice,
  calculateUserPriceToNearestTickPrice,
} from "./pool-helpers";

const ASTRIA_CHAIN = getChainConfigs(FlameNetwork.MAINNET).astriaChains
  .Astria as AstriaChain;

const TOKEN_0 = ASTRIA_CHAIN.currencies.find(
  (it) => it.coinDenom === "WTIA",
) as EvmCurrency;
const TOKEN_1 = ASTRIA_CHAIN.currencies.find(
  (it) => it.coinDenom === "USDC",
) as EvmCurrency;

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

describe("calculateUserPriceToNearestTickPrice", () => {
  it("should convert user price to nearest tick price", () => {
    const result = calculateUserPriceToNearestTickPrice({
      price: 2,
      token0: TOKEN_0,
      token1: TOKEN_1,
      feeTier: 3000,
    });

    // Legacy app: 1.9984
    expect(result).toEqual("1.998442298074652790");
  });

  it("should handle minimum price", () => {
    const result = calculateUserPriceToNearestTickPrice({
      price: 0,
      token0: TOKEN_0,
      token1: TOKEN_1,
      feeTier: 3000,
    });

    expect(result).toEqual("0");
  });

  it("should handle maximum price", () => {
    const result = calculateUserPriceToNearestTickPrice({
      price: Infinity,
      token0: TOKEN_0,
      token1: TOKEN_1,
      feeTier: 3000,
    });

    expect(result).toEqual("Infinity");
  });
});

describe("calculateNewPoolPrices", () => {
  it("should throw an error if price is zero", () => {
    try {
      calculateNewPoolPrices({
        price: 0,
        token0: TOKEN_0,
        token1: TOKEN_1,
        feeTier: 3000,
      });
    } catch (error) {
      expect(error).toBeInstanceOf(RangeError);
    }
  });

  it("should calculate new pool prices", () => {
    (() => {
      const result = calculateNewPoolPrices({
        price: 0.5,
        token0: TOKEN_0,
        token1: TOKEN_1,
        feeTier: 500,
      });

      // Legacy app: 0.500042
      expect(result.token0Price).toEqual("0.500042240322764881");
      // Legacy app: 1.99983
      expect(result.token1Price).toEqual("1.999831");
    })();

    (() => {
      const result = calculateNewPoolPrices({
        price: 1,
        token0: TOKEN_0,
        token1: TOKEN_1,
        feeTier: 500,
      });

      expect(result.token0Price).toEqual("1.000002643830950671");
      expect(result.token1Price).toEqual("0.999997");
    })();

    (() => {
      const result = calculateNewPoolPrices({
        price: 2,
        token0: TOKEN_0,
        token1: TOKEN_1,
        feeTier: 500,
      });

      // Legacy app: 2.00004
      expect(result.token0Price).toEqual("2.000041611588882732");
      // Legacy app: 0.499990
      expect(result.token1Price).toEqual("0.499990");
    })();
  });
});
