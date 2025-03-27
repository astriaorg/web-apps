import type { Config } from "@wagmi/core";
import { type Address, Abi } from "viem";
import { HexString } from "@repo/flame-types";
import { GenericContractService } from "../generic-contract-service";
import POOL_FACTORY_ABI from "./pool-factory-abi.json";

export class PoolFactoryService extends GenericContractService {
  /**
   * Creates a new PoolFactoryService instance
   *
   * @param wagmiConfig - The wagmi configuration object
   * @param contractAddress - The address of the Uniswap V3 factory contract
   */
  constructor(wagmiConfig: Config, contractAddress: Address) {
    super(wagmiConfig, contractAddress, POOL_FACTORY_ABI as Abi);
  }

  /**
   * Get the pool address for a given token pair and fee
   *
   * @param chainId - The chain ID of the EVM chain
   * @param token0 - The address of the first token in the pair
   * @param token1 - The address of the second token in the pair
   * @param fee - The fee tier of the pool (e.g., 500 for 0.05%, 3000 for 0.3%)
   * @returns The address of the pool if it exists, or the zero address if not
   */
  async getPool(
    chainId: number,
    token0: Address,
    token1: Address,
    fee: number,
  ): Promise<Address> {
    return (await this.readContractMethod(chainId, "getPool", [
      token0,
      token1,
      fee,
    ])) as Address;
  }

  /**
   * Create a new Uniswap V3 pool for a token pair with specified fee
   *
   * @param chainId - The chain ID of the EVM chain
   * @param token0 - The address of the first token in the pair
   * @param token1 - The address of the second token in the pair
   * @param fee - The fee tier of the pool (e.g., 500 for 0.05%, 3000 for 0.3%)
   * @returns Transaction hash if successful
   */
  async createPool(
    chainId: number,
    token0: Address,
    token1: Address,
    fee: number,
  ): Promise<HexString> {
    const txHash = await this.writeContractMethod(chainId, "createPool", [
      token0,
      token1,
      fee,
    ]);

    return txHash;
  }
}

/**
 * Factory function to create a new PoolFactoryService instance
 *
 * @param wagmiConfig - The wagmi configuration object
 * @param contractAddress - The address of the Uniswap V3 factory contract
 * @returns A new PoolFactoryService instance
 */
export function createPoolFactoryService(
  wagmiConfig: Config,
  contractAddress: Address,
): PoolFactoryService {
  return new PoolFactoryService(wagmiConfig, contractAddress);
}
