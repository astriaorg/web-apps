import type { Config } from "@wagmi/core";
import { type Address, erc20Abi, type Hash } from "viem";

import { GenericContractService } from "../generic-contract-service";

interface TransferParams {
  recipient: Address;
  amount: bigint;
  chainId: number;
}

export class ERC20Service extends GenericContractService {
  constructor(config: Config, address: Address) {
    super(config, address, erc20Abi);
  }

  /**
   * Transfer tokens from the user's address to another address.
   *
   * @param chainId - The chain ID of the EVM chain.
   * @param recipientAddress - The address of the recipient.
   * @param amount - The amount of tokens to transfer as a string.
   * @returns Transaction hash if successful.
   */
  async transfer({
    recipient,
    amount,
    chainId,
  }: TransferParams): Promise<Hash> {
    return await this.writeContractMethod(chainId, "transfer", [
      recipient,
      amount,
    ]);
  }

  /**
   * Approve a contract to spend tokens on behalf of the user.
   *
   * @param chainId - The chain ID of the EVM chain.
   * @param spender - The address of the contract that is granted approval to be a recipient of transfers from this ERC20.
   * @param amount - The amount of tokens to approve.
   * @returns Object containing transaction hash if successful.
   */
  async approve(
    chainId: number,
    spender: Address,
    amount: bigint,
  ): Promise<Hash> {
    return await this.writeContractMethod(chainId, "approve", [
      spender,
      amount,
    ]);
  }

  /**
   * Get the current allowance of a token for a specific contract.
   *
   * @param chainId - The chain ID of the EVM chain.
   * @param owner - The address of the user.
   * @param spender - The address of the contract to check allowance for.
   * @returns The current allowance of the token, or null if no allowance.
   */
  async allowance(
    chainId: number,
    owner: Address,
    spender: Address,
  ): Promise<bigint> {
    const allowance = await this.readContractMethod<bigint>(
      chainId,
      "allowance",
      [owner, spender],
    );

    return allowance;
  }

  async balanceOf(chainId: number, address: string): Promise<bigint> {
    return this.readContractMethod(chainId, "balanceOf", [address]);
  }
}

export function createERC20Service(
  config: Config,
  address: Address,
): ERC20Service {
  return new ERC20Service(config, address);
}
