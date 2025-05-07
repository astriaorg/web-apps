import type { AstriaChain, EvmCurrency } from "@repo/flame-types";

import {
  needToReverseTokenOrder,
  shouldReverseTokenOrder,
} from "./services.utils";

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

/**
 * Helper to create a mock token without all the required properties.
 */
const createMockToken = (
  erc20ContractAddress: string,
  isWrappedNative: boolean,
): EvmCurrency => {
  return { erc20ContractAddress, isWrappedNative } as unknown as EvmCurrency;
};

describe("shouldReverseTokenOrder", () => {
  const chain = {
    contracts: {
      wrappedNativeToken: {
        address: "0x0000000000000000000000000000000000000001",
      },
    },
  } as unknown as AstriaChain;

  it("should return false when tokenA is a wrapped native token and tokenB is not", () => {
    const tokenA = createMockToken(
      "0xBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB",
      true,
    );
    const tokenB = createMockToken(
      "0xAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
      false,
    );

    expect(shouldReverseTokenOrder({ tokenA, tokenB, chain })).toBe(false);
  });

  it("should return true when tokenB is a wrapped native token and tokenA is not", () => {
    const tokenA = createMockToken(
      "0xAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
      false,
    );
    const tokenB = createMockToken(
      "0xBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB",
      true,
    );

    expect(shouldReverseTokenOrder({ tokenA, tokenB, chain })).toBe(true);
  });

  it("should return true when tokenA has a higher address than tokenB", () => {
    const tokenA = createMockToken(
      "0xBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB",
      false,
    );
    const tokenB = createMockToken(
      "0xAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
      false,
    );

    expect(shouldReverseTokenOrder({ tokenA, tokenB, chain })).toBe(true);
  });

  it("should return false when tokenA has a lower address than tokenB", () => {
    const tokenA = createMockToken(
      "0xAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
      false,
    );
    const tokenB = createMockToken(
      "0xBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB",
      false,
    );

    expect(shouldReverseTokenOrder({ tokenA, tokenB, chain })).toBe(false);
  });

  it("should handle case insensitive address comparison", () => {
    const tokenA = createMockToken(
      "0xAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
      false,
    );
    const tokenB = createMockToken(
      "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
      false,
    );

    expect(shouldReverseTokenOrder({ tokenA, tokenB, chain })).toBe(false);
  });

  it("should return false when both tokens have the same address", () => {
    const tokenA = createMockToken(
      "0xAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
      false,
    );
    const tokenB = createMockToken(
      "0xAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
      false,
    );

    expect(shouldReverseTokenOrder({ tokenA, tokenB, chain })).toBe(false);
  });
});
