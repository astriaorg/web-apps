import type { Config } from "@wagmi/core";
import { type Abi, type Address, parseUnits } from "viem";

import { GenericContractService } from "../generic-contract-service";
import { HexString } from "@repo/flame-types";

/**
 * Interface representing the parameters required for initiating a withdrawal
 * transaction on the Astria platform to an IBC chain.
 */
export interface WithdrawToIbcChainParams {
  /** The unique identifier of the chain from which the withdrawal is being initiated. */
  chainId: number;

  /**
   * The destination chain's address where the withdrawn funds will be sent.
   * The chain can be derived from the address, so we do not have to explicitly
   * pass in the destination chain.
   */
  destinationChainAddress: string;

  /** The amount to be withdrawn. */
  amount: string;

  /** The denomination of the amount. */
  amountDenom: number;

  /** The fee to be included for the transaction. */
  fee: string;

  /** Optional memo or note to attach to the transaction. */
  memo: string;
}

/**
 * AstriaWithdrawerService extends the GenericContractService and provides
 * functionality to initiate withdrawals for a native currency from a given
 * contract address to a destination chain address on an IBC-compatible chain.
 */
export class AstriaWithdrawerService extends GenericContractService {
  private static readonly ABI = [
    {
      type: "function",
      name: "withdrawToIbcChain",
      inputs: [
        { type: "string", name: "destinationChainAddress" },
        { type: "string", name: "memo" },
      ],
      outputs: [],
      stateMutability: "payable",
    },
  ] as const;

  constructor(wagmiConfig: Config, contractAddress: Address) {
    super(wagmiConfig, contractAddress, AstriaWithdrawerService.ABI);
  }

  async withdrawToIbcChain({
    chainId,
    destinationChainAddress,
    amount,
    amountDenom,
    fee,
    memo,
  }: WithdrawToIbcChainParams): Promise<HexString> {
    const amountWei = parseUnits(amount, amountDenom);
    const feeWei = BigInt(fee);
    const totalAmount = amountWei + feeWei;
    return this.writeContractMethod(
      chainId,
      "withdrawToIbcChain",
      [destinationChainAddress, memo],
      totalAmount,
    );
  }
}

/**
 * AstriaErc20WithdrawerService extends the GenericContractService and provides
 * functionality to initiate ERC-20 token withdrawals from a given contract
 * address to a destination chain address on an IBC-compatible chain.
 */
export class AstriaErc20WithdrawerService extends GenericContractService {
  private static readonly ABI = [
    {
      type: "function",
      name: "withdrawToIbcChain",
      inputs: [
        { type: "uint256", name: "amount" },
        { type: "string", name: "destinationChainAddress" },
        { type: "string", name: "memo" },
      ],
      outputs: [],
      stateMutability: "payable",
    },
    {
      type: "function",
      name: "balanceOf",
      inputs: [{ type: "address", name: "owner" }],
      outputs: [{ type: "uint256" }],
      stateMutability: "view",
    },
  ] as const satisfies Abi;

  constructor(wagmiConfig: Config, contractAddress: Address) {
    super(wagmiConfig, contractAddress, AstriaErc20WithdrawerService.ABI);
  }

  async withdrawToIbcChain({
    chainId,
    destinationChainAddress,
    amount,
    amountDenom,
    fee,
    memo,
  }: WithdrawToIbcChainParams): Promise<HexString> {
    const amountBaseUnits = parseUnits(amount, amountDenom);
    const feeWei = BigInt(fee);
    return this.writeContractMethod(
      chainId,
      "withdrawToIbcChain",
      [amountBaseUnits, destinationChainAddress, memo],
      feeWei,
    );
  }

  async getBalance(chainId: number, address: string): Promise<bigint> {
    return this.readContractMethod(chainId, "balanceOf", [address]);
  }
}

export function createWithdrawerService(
  wagmiConfig: Config,
  contractAddress: Address,
  isErc20 = false,
): AstriaWithdrawerService | AstriaErc20WithdrawerService {
  return isErc20
    ? new AstriaErc20WithdrawerService(wagmiConfig, contractAddress)
    : new AstriaWithdrawerService(wagmiConfig, contractAddress);
}
