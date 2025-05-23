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
   * Get multiple pools using multicall.
   */
  async getPools(
    params: {
      token0: Address;
      token1: Address;
      fee: number;
    }[],
  ) {
    const result = await this.multicall({
      contracts: params.map((it) => {
        return {
          functionName: "getPool",
          address: this.address,
          abi: this.abi,
          args: [it.token0, it.token1, it.fee],
        };
      }),
    });

    return result as Address[];
  }

  /**
   * Get the liquidity and slot0 data for a given array of pool addresses.
   * Pools with zero addresses will throw an error for slot0.
   *
   * @param addresses - The addresses of the pools to get liquidity and slot0 data for.
   * @returns An array of objects containing the pool address and its corresponding liquidity and slot0 data.
   */
  async getLiquidityAndSlot0ForPools(addresses: Address[]): Promise<
    {
      address: Address;
      liquidity: bigint;
      slot0: Slot0;
    }[]
  > {
    const contracts = [];

    for (const address of addresses) {
      contracts.push({
        functionName: "liquidity",
        address,
        abi: POOL_ABI as Abi,
        args: [],
      });
      contracts.push({
        functionName: "slot0",
        address,
        abi: POOL_ABI as Abi,
        args: [],
      });
    }

    const result = await this.multicall({
      contracts,
    });

    return addresses.map((it, index) => {
      const liquidityIndex = index * 2; // Liquidity is at even indices.
      const slot0Index = liquidityIndex + 1; // Slot0 is at odd indices.

      return {
        address: it as Address,
        liquidity: result[liquidityIndex] as bigint,
        slot0: mapSlot0ResponseToSlot0(result[slot0Index] as Slot0Response),
      };
    });
  }

  /**
   * Get the pool address for a given token pair and fee.
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
