import { type Config } from "@wagmi/core";
import { Abi, type Address, type Hash } from "viem";

import { GenericContractService } from "../generic-contract-service";
import {
  mapSlot0ResponseToSlot0,
  POOL_ABI,
  type Slot0,
  type Slot0Response,
} from "../pool-service";
import POOL_FACTORY_ABI from "./pool-factory-abi.json";

export class PoolFactoryService extends GenericContractService {
  constructor(config: Config, address: Address) {
    super(config, address, POOL_FACTORY_ABI as Abi);
  }

  /**
   * Get the pool addresses for a given token pair and an array of fee tiers.
   *
   * @param token0 - The address of the first token in the pair.
   * @param token1 - The address of the second token in the pair.
   * @param fees - An array of fee tiers for the pool (e.g., [500, 3000]).
   * @returns The address of the pool if it exists, or the zero address if not.
   */
  async getPools(token0: Address, token1: Address, fees: number[]) {
    const result = await this.multicall({
      contracts: fees.map((it) => {
        return {
          functionName: "getPool",
          address: this.address,
          abi: this.abi,
          args: [token0, token1, it],
        };
      }),
    });

    return result as Address[];
  }

  /**
   * Get the slot0 data for a given array of pool addresses.
   *
   * @param addresses - The addresses of the pools to get slot0 data for.
   * @returns An array of objects containing the pool address and its corresponding slot0 data.
   */
  async getPoolsSlot0(addresses: Address[]): Promise<
    {
      address: Address;
      slot0: Slot0;
    }[]
  > {
    const result = await this.multicall({
      contracts: addresses.map((it) => {
        return {
          functionName: "slot0",
          address: it,
          abi: POOL_ABI as Abi,
          args: [],
        };
      }),
    });

    return result.map((it, index) => {
      return {
        address: addresses[index] as Address,
        slot0: mapSlot0ResponseToSlot0(it as Slot0Response),
      };
    });
  }

  /**
   * Get the pool address for a given token pair and fee.
   *
   * @param chainId - The chain ID of the EVM chain.
   * @param token0 - The address of the first token in the pair.
   * @param token1 - The address of the second token in the pair.
   * @param fee - The fee tier of the pool (e.g., 500 for 0.05%, 3000 for 0.3%).
   * @returns The address of the pool if it exists, or the zero address if not.
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
   * Create a new Uniswap V3 pool for a token pair with specified fee.
   *
   * @param chainId - The chain ID of the EVM chain.
   * @param token0 - The address of the first token in the pair.
   * @param token1 - The address of the second token in the pair.
   * @param fee - The fee tier of the pool (e.g., 500 for 0.05%, 3000 for 0.3%).
   * @returns Transaction hash if successful.
   */
  async createPool(
    chainId: number,
    token0: Address,
    token1: Address,
    fee: number,
  ): Promise<Hash> {
    const txHash = await this.writeContractMethod(chainId, "createPool", [
      token0,
      token1,
      fee,
    ]);

    return txHash;
  }
}

export function createPoolFactoryService(
  config: Config,
  address: Address,
): PoolFactoryService {
  return new PoolFactoryService(config, address);
}
