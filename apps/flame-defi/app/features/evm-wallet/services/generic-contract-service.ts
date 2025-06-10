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
    protected readonly config: Config,
    protected readonly address: Address,
    protected readonly abi: Abi,
  ) {}

  /**
   * Helper to get the wallet client
   */
  protected async getWalletClient(
    chainId: number,
  ): Promise<GetWalletClientReturnType> {
    const walletClient = await getWalletClient(this.config, { chainId });
    if (!walletClient) {
      throw new Error("No wallet client available.");
    }
    return walletClient;
  }

  /**
   * Helper to get the public client
   */
  protected async getPublicClient(chainId: number): Promise<PublicClient> {
    const publicClient = getPublicClient(this.config, { chainId });
    if (!publicClient) {
      throw new Error("No public client available.");
    }
    return publicClient;
  }

  /**
   * Estimates gas limit and adds a buffer.
   * This is useful for multicall transactions where the gas limit may need to be significantly higher than the estimate.
   *
   * @returns The estimated gas limit, with buffer added.
   */
  protected async estimateContractGasWithBuffer(
    chainId: number,
    calls: string[],
    value: bigint,
    buffer?: number,
  ): Promise<bigint> {
    const DEFAULT_GAS_LIMIT = 300000n;
    const DEFAULT_BUFFER = 0.2; // Default 20% buffer.

    try {
      const walletClient = await this.getWalletClient(chainId);
      const publicClient = await this.getPublicClient(chainId);
      const signerAddress = walletClient.account?.address as Address;

      const estimatedGas = await publicClient.estimateContractGas({
        address: this.address,
        abi: this.abi,
        functionName: "multicall",
        args: [calls],
        account: signerAddress,
        value,
      });

      // Increase the estimated gas by the buffer.
      return (
        estimatedGas +
        BigInt(
          (estimatedGas *
            BigInt(Math.round((buffer ?? DEFAULT_BUFFER) * 100))) /
            100n,
        )
      );
    } catch (err) {
      console.warn("Gas estimation failed, using default limit.", err);
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
        address: this.address,
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
        address: this.address,
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
    const result = await multicall(this.config, parameters);

    for (const call of result) {
      if (call.error) {
        throw new Error(`Multicall error: ${call.error}`);
      }
    }

    return result.map((it) => it.result);
  }
}
