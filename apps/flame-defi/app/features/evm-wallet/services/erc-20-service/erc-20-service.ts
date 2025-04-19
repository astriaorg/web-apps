import type { Config } from "@wagmi/core";
import { type Address, erc20Abi, parseUnits } from "viem";
import { HexString } from "@repo/flame-types";
import { GenericContractService } from "../generic-contract-service";

interface TransferParams {
  recipient: Address;
  amount: bigint;
  chainId: number;
}

export class Erc20Service extends GenericContractService {
  constructor(wagmiConfig: Config, contractAddress: Address) {
    super(wagmiConfig, contractAddress, erc20Abi);
  }

  /**
   * Transfer tokens from the user's address to another address.
   *
   * @param chainId - The chain ID of the EVM chain
   * @param recipientAddress - The address of the recipient
   * @param amount - The amount of tokens to transfer as a string
   * @returns Transaction hash if successful
   */
  async transfer({
    recipient,
    amount,
    chainId,
  }: TransferParams): Promise<HexString> {
    return await this.writeContractMethod(chainId, "transfer", [
      recipient,
      amount,
    ]);
  }

  /**
   * Approve a contract to spend tokens on behalf of the user.
   *
   * @param chainId - The chain ID of the EVM chain
   * @param contractAddress - The address of the contract that is granted approval to be a recipient of transfers from this ERC20
   * @param tokenApprovalAmount - The amount of tokens to approve as a string
   * @param decimals - The number of decimals of the token
   * @returns Object containing transaction hash if successful
   */
  async approveToken(
    chainId: number,
    contractAddress: Address,
    tokenApprovalAmount: string,
    decimals: number,
  ): Promise<HexString> {
    const amountAsBigInt = parseUnits(tokenApprovalAmount, decimals);
    return await this.writeContractMethod(chainId, "approve", [
      contractAddress,
      amountAsBigInt,
    ]);
  }

  /**
   * Get the current allowance of a token for a specific contract.
   *
   * @param chainId - The chain ID of the EVM chain
   * @param userAddress - The address of the user
   * @param contractAddress - The address of the contract to check allowance for
   * @returns The current allowance of the token as a Big.js instance
   */
  async getTokenAllowance(
    chainId: number,
    userAddress: HexString,
    contractAddress: Address,
  ): Promise<string | null> {
    const currentAllowance = await this.readContractMethod(
      chainId,
      "allowance",
      [userAddress, contractAddress],
    );

    if (currentAllowance === null) {
      return null;
    }

    const allowance = currentAllowance as bigint;
    return allowance.toString();
  }
}

export function createErc20Service(
  wagmiConfig: Config,
  contractAddress: Address,
): Erc20Service {
  return new Erc20Service(wagmiConfig, contractAddress);
}
