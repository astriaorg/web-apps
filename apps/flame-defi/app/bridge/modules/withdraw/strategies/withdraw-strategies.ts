import { Config } from "wagmi";

import {
  ChainType,
  EvmChainInfo,
  EvmCurrency,
  HexString,
} from "@repo/flame-types";
import { createWithdrawerService } from "features/evm-wallet";

import {
  BridgeStrategy,
  BridgeStrategyContext,
  EvmIntentBridgeStrategy,
} from "bridge/strategies";

/**
 * Base withdraw strategy interface
 */
export interface WithdrawStrategy {
  execute(recipientAddress: HexString): Promise<void>;
}

/**
 * Implementation of IBC Withdraw strategy (Astria to Cosmos)
 */
export class AstriaIbcWithdrawStrategy implements WithdrawStrategy {
  private readonly wagmiConfig: Config;
  private readonly amount: string;
  private readonly sourceChain: EvmChainInfo;
  private readonly sourceCurrency: EvmCurrency;

  constructor(context: Omit<BridgeStrategyContext, "cosmosWallet">) {
    const {
      sourceConnection: { address, chain, currency },
    } = context;
    if (!address || !chain || !currency) {
      throw new Error(
        "Source chain, currency, and address are required to create a withdraw strategy",
      );
    }

    this.wagmiConfig = context.wagmiConfig;
    this.amount = context.amount;
    this.sourceChain = chain as EvmChainInfo;
    this.sourceCurrency = currency as EvmCurrency;
  }

  async execute(recipientAddress: HexString): Promise<void> {
    if (!this.sourceChain || !this.sourceCurrency) {
      throw new Error(
        "Please select an Astria chain and token to withdraw first.",
      );
    }

    const [contractAddress, isErc20] = (() => {
      if (this.sourceCurrency.isNative) {
        return [
          this.sourceCurrency.nativeTokenWithdrawerContractAddress,
          false,
        ];
      }
      return [this.sourceCurrency.erc20ContractAddress, true];
    })();

    if (!contractAddress) {
      throw new Error("No contract address found for source token.");
    }

    const withdrawerService = createWithdrawerService(
      this.wagmiConfig,
      contractAddress,
      isErc20,
    );

    await withdrawerService.withdrawToIbcChain({
      chainId: this.sourceChain.chainId,
      destinationChainAddress: recipientAddress,
      amount: this.amount,
      amountDenom: this.sourceCurrency.coinDecimals,
      fee: this.sourceCurrency.ibcWithdrawalFeeWei ?? "0",
      memo: "",
    });
  }
}

/**
 * Creates the appropriate withdraw strategy based on the destination chain type
 */
export function createWithdrawStrategy(
  context: BridgeStrategyContext,
  destinationChainType: ChainType,
): BridgeStrategy {
  const { sourceConnection } = context;
  console.log({ context });

  if (sourceConnection.chain?.chainType !== ChainType.ASTRIA) {
    throw new Error("Withdraw is only supported from Astria EVM chains");
  }

  // Choose strategy based on destination chain type
  switch (destinationChainType) {
    case ChainType.COSMOS:
      return new AstriaIbcWithdrawStrategy(context);
    case ChainType.EVM:
      return new EvmIntentBridgeStrategy(context);
    default:
      throw new Error(
        `Error creating withdraw strategy. Unsupported destination chain type: ${destinationChainType}`,
      );
  }
}
