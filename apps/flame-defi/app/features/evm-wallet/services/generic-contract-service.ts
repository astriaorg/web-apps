import {
  type Config,
  getPublicClient,
  getWalletClient,
  type GetWalletClientReturnType,
} from "@wagmi/core";
import type { Abi, Address, Hash, PublicClient } from "viem";

export class GenericContractService {
  constructor(
    protected readonly wagmiConfig: Config,
    protected readonly contractAddress: Address,
    protected readonly abi: Abi,
  ) {}

  /**
   * Helper to get the wallet client
   */
  protected async getWalletClient(
    chainId: number,
  ): Promise<GetWalletClientReturnType> {
    const walletClient = await getWalletClient(this.wagmiConfig, { chainId });
    if (!walletClient) {
      throw new Error("No wallet client available");
    }
    return walletClient;
  }

  /**
   * Helper to get the public client
   */
  protected async getPublicClient(chainId: number): Promise<PublicClient> {
    const publicClient = getPublicClient(this.wagmiConfig, { chainId });
    if (!publicClient) {
      throw new Error("No public client available");
    }
    return publicClient;
  }

  protected async readContractMethod<T>(
    chainId: number,
    methodName: string,
    args: unknown[] = [],
  ): Promise<T> {
    try {
      const publicClient = await this.getPublicClient(chainId);
      return (await publicClient.readContract({
        address: this.contractAddress,
        abi: this.abi,
        functionName: methodName,
        args,
      })) as T;
    } catch (e) {
      console.error(`Error reading contract method ${methodName}:`, e);
      throw e;
    }
  }

  protected async writeContractMethod(
    chainId: number,
    methodName: string,
    args: unknown[] = [],
    value?: bigint,
    gasLimit?: bigint,
  ): Promise<Hash> {
    try {
      const walletClient = await this.getWalletClient(chainId);
      return await walletClient.writeContract({
        address: this.contractAddress,
        abi: this.abi,
        functionName: methodName,
        args,
        value,
        gas: gasLimit,
      });
    } catch (e) {
      console.error(`Error in ${methodName}:`, e);
      throw e;
    }
  }
}
