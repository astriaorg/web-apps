import type { Config } from "@wagmi/core";
import { type Address, Abi } from "viem";
import { HexString } from "@repo/flame-types";
import { GenericContractService } from "../generic-contract-service";
import POOL_FACTORY_ABI from "./pool-factory-abi.json";

export class PoolFactoryService extends GenericContractService {
  constructor(wagmiConfig: Config, contractAddress: Address) {
    super(wagmiConfig, contractAddress, POOL_FACTORY_ABI as Abi);
  }

  /**
   * Approve a contract to spend tokens on behalf of the user.
   *
   * @param chainId - The chain ID of the EVM chain
   * @param token0 - The address of the first token
   * @param token1 - The address of the second token
   * @param fee - The fee for the pool
   * @returns Object containing transaction hash if successful
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

export function createPoolFactoryService(
  wagmiConfig: Config,
  contractAddress: Address,
): PoolFactoryService {
  return new PoolFactoryService(wagmiConfig, contractAddress);
}
