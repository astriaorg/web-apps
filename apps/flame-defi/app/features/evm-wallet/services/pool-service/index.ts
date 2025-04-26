import type { Config } from "@wagmi/core";
import { type Address, Abi } from "viem";
import { GenericContractService } from "../generic-contract-service";
import POOL_ABI from "./pool-contract-abi.json";

export type Slot0Data = {
  sqrtPriceX96: bigint;
  tick: number;
  observationIndex: number;
  observationCardinality: number;
  observationCardinalityNext: number;
  feeProtocol: number;
  unlocked: boolean;
};

type Slot0ResponseTuple = [
  bigint, // sqrtPriceX96
  number, // tick
  number, // observationIndex
  number, // observationCardinality
  number, // observationCardinalityNext
  number, // feeProtocol
  boolean, // unlocked
];

export class PoolService extends GenericContractService {
  /**
   * Creates a new PoolService instance
   *
   * @param wagmiConfig - The wagmi configuration object
   * @param contractAddress - The address of the Uniswap V3 pool contract
   */
  constructor(wagmiConfig: Config, contractAddress: Address) {
    super(wagmiConfig, contractAddress, POOL_ABI as Abi);
  }

  /**
   * Get the current slot0 data from the pool
   *
   * @param chainId - The chain ID of the EVM chain
   * @returns Slot0Data object containing the current price, tick, and other pool state variables
   */
  async getSlot0(chainId: number): Promise<Slot0Data> {
    const slot0 = await this.readContractMethod<Slot0ResponseTuple>(
      chainId,
      "slot0",
      [],
    );

    return {
      sqrtPriceX96: slot0[0],
      tick: slot0[1],
      observationIndex: slot0[2],
      observationCardinality: slot0[3],
      observationCardinalityNext: slot0[4],
      feeProtocol: slot0[5],
      unlocked: slot0[6],
    };
  }

  /**
   * Get the current liquidity of the pool
   *
   * @param chainId - The chain ID of the EVM chain
   * @returns The total liquidity currently active in the pool as a bigint
   */
  async getLiquidity(chainId: number): Promise<bigint> {
    return await this.readContractMethod<bigint>(chainId, "liquidity", []);
  }

  /**
   * Get the current tick spacing of the pool
   *
   * @param chainId - The chain ID of the EVM chain
   * @returns The tick spacing value which depends on the pool's fee tier
   */
  async getTickSpacing(chainId: number): Promise<number> {
    return await this.readContractMethod<number>(chainId, "tickSpacing", []);
  }

  /**
   * Get feeGrowthGlobal0X128 value from the pool
   *
   * @param chainId - The chain ID of the EVM chain
   * @returns The accumulated protocol fees for token0 as a bigint
   */
  async getFeeGrowthGlobal0X128(chainId: number): Promise<bigint> {
    return await this.readContractMethod<bigint>(
      chainId,
      "feeGrowthGlobal0X128",
      [],
    );
  }

  /**
   * Get feeGrowthGlobal1X128 value from the pool
   *
   * @param chainId - The chain ID of the EVM chain
   * @returns The accumulated protocol fees for token1 as a bigint
   */
  async getFeeGrowthGlobal1X128(chainId: number): Promise<bigint> {
    return await this.readContractMethod<bigint>(
      chainId,
      "feeGrowthGlobal1X128",
      [],
    );
  }
}

/**
 * Factory function to create a new PoolService instance
 *
 * @param wagmiConfig - The wagmi configuration object
 * @param contractAddress - The address of the Uniswap V3 pool contract
 * @returns A new PoolService instance
 */
export function createPoolService(
  wagmiConfig: Config,
  contractAddress: Address,
): PoolService {
  return new PoolService(wagmiConfig, contractAddress);
}
