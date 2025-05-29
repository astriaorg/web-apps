import type { Config } from "@wagmi/core";
import { Abi, type Address, type Hash } from "viem";

import { GenericContractService } from "../generic-contract-service";
import ASTRIA_BRIDGE_SOURCE_ABI from "./astria-bridge-source-abi.json";

interface BridgeTokensParams {
  recipientAddress: Address;
  amount: bigint;
  chainId: number;
}

interface BridgeAndSwapTokensParams {
  recipientAddress: Address;
  amount: bigint;
  assetToReceive: Address;
  chainId: number;
}

/**
 * AstriaBridgeSourceService enables bridging and optional token swapping
 * from a source EVM chain to another chain through smart contracts.
 */
export class AstriaBridgeSourceService extends GenericContractService {
  constructor(wagmiConfig: Config, contractAddress: Address) {
    super(wagmiConfig, contractAddress, ASTRIA_BRIDGE_SOURCE_ABI as Abi);
  }

  /**
   * Bridge tokens to another chain.
   *
   * @param recipientAddress - The address of the recipient on the destination chain
   * @param amount - The amount of tokens to bridge
   * @param chainId - The chain ID of the source EVM chain
   * @returns Transaction hash if successful
   */
  async bridgeTokens({
    recipientAddress,
    amount,
    // FIXME - could totally refactor the GenericService so we don't
    //  have to always pass in chain id at method call time
    chainId,
  }: BridgeTokensParams): Promise<Hash> {
    return await this.writeContractMethod(chainId, "bridgeTokens", [
      recipientAddress,
      amount,
    ]);
  }

  /**
   * Bridge tokens to another chain and swap them for a different asset.
   *
   * @param recipientAddress - The address of the recipient on the destination chain
   * @param amount - The amount of tokens to bridge
   * @param assetToReceive - The address of the asset to receive after the swap
   * @param chainId - The chain ID of the source EVM chain
   * @returns Transaction hash if successful
   */
  async bridgeAndSwap({
    recipientAddress,
    amount,
    assetToReceive,
    chainId,
  }: BridgeAndSwapTokensParams): Promise<Hash> {
    return await this.writeContractMethod(chainId, "bridgeAndSwap", [
      recipientAddress,
      amount,
      assetToReceive,
    ]);
  }

  /**
   * Get the ERC20 contract address.
   *
   * @param chainId - The chain ID of the EVM chain
   * @returns The ERC20 contract address
   */
  async getErc20Contract(chainId: number): Promise<Address> {
    return await this.readContractMethod(chainId, "erc20Contract");
  }
}

export function createAstriaBridgeSourceService(
  wagmiConfig: Config,
  contractAddress: Address,
): AstriaBridgeSourceService {
  return new AstriaBridgeSourceService(wagmiConfig, contractAddress);
}
