import type { Config } from "@wagmi/core";
import { type Address, Abi } from "viem";
import { GenericContractService } from "../generic-contract-service";
import POOL_ABI from "./pool-contract-abi.json";

export class PoolService extends GenericContractService {
  constructor(wagmiConfig: Config, contractAddress: Address) {
    super(wagmiConfig, contractAddress, POOL_ABI as Abi);
  }

  /**
   * Get the pool positions of a user.
   *
   * @param chainId - The chain ID of the EVM chain
   * @param tokenId - The ID of the token
   * @returns Object containing transaction hash if successful
   */
  async slot0(
    chainId: number,
    tokenId: Address,
    sqrtPriceX96: number,
    tick: number,
    observationIndex: number,
    observationCardinality: number,
    observationCardinalityNext: number,
    feeProtocol: number,
    unlocked: boolean,
  ): Promise<any> {
    // TODO: update this type when the data structure is known
    const slot0 = await this.readContractMethod(chainId, "slot0", [
      tokenId,
      sqrtPriceX96,
      tick,
      observationIndex,
      observationCardinality,
      observationCardinalityNext,
      feeProtocol,
      unlocked,
    ]);

    return slot0;
  }

  async liquidity(
    chainId: number,
    tokenId: Address,
  ): Promise<any> {
    const liquidity = await this.readContractMethod(chainId, "liquidity", [
      tokenId,
    ]);

    return liquidity;
  }

}

export function createPoolService(
  wagmiConfig: Config,
  contractAddress: Address,
): PoolService {
  return new PoolService(wagmiConfig, contractAddress);
}
