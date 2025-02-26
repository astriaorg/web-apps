import type { Config } from "@wagmi/core";
import { type Address, erc20Abi } from "viem";
import { GenericContractService } from "../generic-contract-service";

export class TokenApprovalService extends GenericContractService {
  constructor(wagmiConfig: Config, contractAddress: Address) {
    super(wagmiConfig, contractAddress, erc20Abi);
  }

  /**
   * Approve a contract to spend tokens on behalf of the user.
   *
   * @param chainId - The chain ID of the EVM chain
   * @param contractAddress - The address of the contract to approve
   * @param tokenApprovalAmount - The amount of tokens to approve as a string
   * @returns Object containing transaction hash if successful, null if failed
   */
  async approveToken(
    chainId: number,
    contractAddress: Address,
    tokenApprovalAmount: string,
  ): Promise<`0x${string}`> {
    const amountAsBigInt = BigInt(tokenApprovalAmount);
    // NOTE: Reset this to 0 whenever we want to reset the approval
    // const amountAsBigInt = BigInt('0');
    const txHash = await this.writeContractMethod(chainId, "approve", [
      contractAddress,
      amountAsBigInt,
    ]);

    return txHash;
  }

  /**
   * Get the current allowance of a token for a specific contract.
   *
   * @param chainId - The chain ID of the EVM chain
   * @param userAddress - The address of the user
   * @param contractAddress - The address of the contract to check allowance for
   * @returns The current allowance of the token as a bigint, or null if failed
   */
  async getTokenAllowances(
    chainId: number,
    userAddress: string,
    contractAddress: Address,
  ): Promise<bigint | null> {
    const currentAllowance = await this.readContractMethod(
      chainId,
      "allowance",
      [userAddress, contractAddress],
    );
    const allowance = currentAllowance as bigint;
    return allowance;
  }
}

export function createTokenApprovalService(
  wagmiConfig: Config,
  contractAddress: Address,
): TokenApprovalService {
  return new TokenApprovalService(wagmiConfig, contractAddress);
}
