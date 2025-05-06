import type { Config } from "@wagmi/core";
import { Abi, type Address } from "viem";

import { GenericContractService } from "../generic-contract-service";
import POOL_ABI from "./pool-abi.json";

export { POOL_ABI };

export type Slot0 = {
  sqrtPriceX96: bigint;
  tick: number;
  observationIndex: number;
  observationCardinality: number;
  observationCardinalityNext: number;
  feeProtocol: number;
  unlocked: boolean;
};

export type Slot0Response = [
  bigint, // sqrtPriceX96
  number, // tick
  number, // observationIndex
  number, // observationCardinality
  number, // observationCardinalityNext
  number, // feeProtocol
  boolean, // unlocked
];

export const mapSlot0ResponseToSlot0 = (response: Slot0Response): Slot0 => ({
  sqrtPriceX96: response[0],
  tick: response[1],
  observationIndex: response[2],
  observationCardinality: response[3],
  observationCardinalityNext: response[4],
  feeProtocol: response[5],
  unlocked: response[6],
});

export class PoolService extends GenericContractService {
  constructor(config: Config, address: Address) {
    super(config, address, POOL_ABI as Abi);
  }

  /**
   * Get the current slot0 data from the pool.
   *
   * @param chainId - The chain ID of the EVM chain.
   * @returns Slot0 object containing the current price, tick, and other pool state variables.
   */
  async slot0(chainId: number): Promise<Slot0> {
    const slot0 = await this.readContractMethod<Slot0Response>(
      chainId,
      "slot0",
      [],
    );

    return mapSlot0ResponseToSlot0(slot0);
  }

  /**
   * Get the current liquidity of the pool.
   *
   * @param chainId - The chain ID of the EVM chain.
   * @returns The total liquidity currently active in the pool as a bigint.
   */
  async liquidity(chainId: number): Promise<bigint> {
    return await this.readContractMethod<bigint>(chainId, "liquidity", []);
  }

  /**
   * Get the current tick spacing of the pool.
   *
   * @param chainId - The chain ID of the EVM chain.
   * @returns The tick spacing value which depends on the pool's fee tier.
   */
  async tickSpacing(chainId: number): Promise<number> {
    return await this.readContractMethod<number>(chainId, "tickSpacing", []);
  }

  /**
   * Get `feeGrowthGlobal0X128` value from the pool.
   *
   * @param chainId - The chain ID of the EVM chain.
   * @returns The accumulated protocol fees for token0 as a bigint.
   */
  async feeGrowthGlobal0X128(chainId: number): Promise<bigint> {
    return await this.readContractMethod<bigint>(
      chainId,
      "feeGrowthGlobal0X128",
      [],
    );
  }

  /**
   * Get `feeGrowthGlobal1X128` value from the pool.
   *
   * @param chainId - The chain ID of the EVM chain.
   * @returns The accumulated protocol fees for token1 as a bigint.
   */
  async feeGrowthGlobal1X128(chainId: number): Promise<bigint> {
    return await this.readContractMethod<bigint>(
      chainId,
      "feeGrowthGlobal1X128",
      [],
    );
  }
}

export function createPoolService(
  config: Config,
  address: Address,
): PoolService {
  return new PoolService(config, address);
}
