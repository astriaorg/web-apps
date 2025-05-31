import {
  type AstriaChain,
  type EvmCurrency,
  FlameNetwork,
} from "@repo/flame-types";
import { getChainConfigs } from "config";

import {
  needToReverseTokenOrder,
  shouldReverseTokenOrder,
} from "./services.utils";

const ASTRIA_CHAIN = getChainConfigs(FlameNetwork.MAINNET).astriaChains
  .Astria as AstriaChain;

const TOKEN_A = ASTRIA_CHAIN.currencies.find(
  (it) => it.coinDenom === "WTIA",
) as EvmCurrency;
const TOKEN_B = ASTRIA_CHAIN.currencies.find(
  (it) => it.coinDenom === "USDC",
) as EvmCurrency;

Object.defineProperty(TOKEN_A, "erc20ContractAddress", {
  get: () => "0xAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
});
Object.defineProperty(TOKEN_B, "erc20ContractAddress", {
  get: () => "0xBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB",
});

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

describe("shouldReverseTokenOrder", () => {
  it("should return false when tokenA is a wrapped native token and tokenB is not", () => {
    expect(shouldReverseTokenOrder({ tokenA: TOKEN_A, tokenB: TOKEN_B })).toBe(
      false,
    );
  });

  it("should return true when tokenB is a wrapped native token and tokenA is not", () => {
    expect(shouldReverseTokenOrder({ tokenA: TOKEN_B, tokenB: TOKEN_A })).toBe(
      true,
    );
  });

  it("should return true when tokenA has a higher address than tokenB", () => {
    expect(shouldReverseTokenOrder({ tokenA: TOKEN_B, tokenB: TOKEN_A })).toBe(
      true,
    );
  });

  it("should return false when tokenA has a lower address than tokenB", () => {
    expect(shouldReverseTokenOrder({ tokenA: TOKEN_A, tokenB: TOKEN_B })).toBe(
      false,
    );
  });

  it("should handle case insensitive address comparison", () => {
    Object.defineProperty(TOKEN_B, "erc20ContractAddress", {
      get: () => "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
    });

    expect(shouldReverseTokenOrder({ tokenA: TOKEN_A, tokenB: TOKEN_B })).toBe(
      false,
    );
  });

  it("should return false when both tokens have the same address", () => {
    expect(shouldReverseTokenOrder({ tokenA: TOKEN_A, tokenB: TOKEN_A })).toBe(
      false,
    );
  });
});
