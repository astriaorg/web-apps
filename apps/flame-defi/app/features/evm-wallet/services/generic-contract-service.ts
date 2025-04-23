import {
  type Config,
  getPublicClient,
  getWalletClient,
  type GetWalletClientReturnType,
  multicall,
  type MulticallParameters,
} from "@wagmi/core";
import type {
  Abi,
  Address,
  ContractFunctionParameters,
  Hash,
  PublicClient,
} from "viem";

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
      throw new Error("No wallet client available.");
    }
    return walletClient;
  }

  /**
   * Helper to get the public client
   */
  protected async getPublicClient(chainId: number): Promise<PublicClient> {
    const publicClient = getPublicClient(this.wagmiConfig, { chainId });
    if (!publicClient) {
      throw new Error("No public client available.");
    }
    return publicClient;
  }

  /**
   * Estimates gas limit for a multicall operation with a 20% buffer
   * @param chainId - The chain ID
   * @param calls - Array of encoded function calls
   * @returns Estimated gas limit with 20% buffer
   */
  protected async estimateMulticallGasLimit(
    chainId: number,
    calls: string[],
  ): Promise<bigint> {
    const DEFAULT_GAS_LIMIT = 300000n;

    try {
      const walletClient = await this.getWalletClient(chainId);
      const publicClient = await this.getPublicClient(chainId);
      const signerAddress = walletClient.account?.address as Address;
      const estimatedGas = await publicClient.estimateContractGas({
        address: this.contractAddress,
        abi: this.abi,
        functionName: "multicall",
        args: [calls],
        account: signerAddress,
      });
      // Increase the estimated gas by 20%
      return (estimatedGas * 120n) / 100n;
    } catch (err) {
      console.warn("Gas estimation failed, using default limit", err);
      return DEFAULT_GAS_LIMIT;
    }
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

  protected async multicall(
    parameters: MulticallParameters<readonly ContractFunctionParameters[]>,
  ): Promise<unknown[]> {
    const result = await multicall(this.wagmiConfig, parameters);

    for (const call of result) {
      if (call.error) {
        throw new Error(`Multicall error: ${call.error}`);
      }
    }

    return result.map((it) => it.result);
  }
}
