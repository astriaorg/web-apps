import type { Config } from "@wagmi/core";
import { type Abi, type Address, type Hash, parseUnits } from "viem";

import WETH_ABI from "./weth.json";
import { GenericContractService } from "../generic-contract-service";

export class WethService extends GenericContractService {
  constructor(wagmiConfig: Config, contractAddress: Address) {
    super(wagmiConfig, contractAddress, WETH_ABI as Abi);
  }

  /**
   * Wrap TIA (native currency on Astria Flame EVM) to WTIA by calling `deposit()`.
   *
   * @param chainId - The chain ID of the EVM chain
   * @param amount - The amount of TIA to deposit as a string (e.g. "1.234")
   * @param decimals - The decimals for TIA (commonly 18 on EVMs)
   */
  async deposit(
    chainId: number,
    amount: string,
    decimals: number,
  ): Promise<Hash> {
    const depositValue = parseUnits(amount, decimals);
    return this.writeContractMethod(chainId, "deposit", [], depositValue);
  }

  /**
   * Unwrap WTIA back into TIA by calling the `withdraw()` function.
   *
   * @param chainId - The chain ID of the EVM chain
   * @param amount - The amount of WTIA to withdraw as a string (e.g. "1.234")
   * @param decimals - The decimals for WTIA (commonly 18 for EVM-compatible)
   */
  async withdraw(
    chainId: number,
    amount: string,
    decimals: number,
  ): Promise<Hash> {
    const withdrawValue = parseUnits(amount, decimals);
    // Note that `withdraw` burns WTIA from the caller and sends back TIA to the same caller.
    return this.writeContractMethod(chainId, "withdraw", [withdrawValue]);
  }
}

export function createWethService(
  wagmiConfig: Config,
  contractAddress: Address,
): WethService {
  return new WethService(wagmiConfig, contractAddress);
}
