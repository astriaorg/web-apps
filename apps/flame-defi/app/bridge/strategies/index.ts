import { Decimal } from "@cosmjs/math";
import { SigningStargateClient } from "@cosmjs/stargate";
import { Config } from "@wagmi/core";
import { type Address, parseUnits } from "viem";

import {
  ChainType,
  CosmosChainInfo,
  EvmChainInfo,
  EvmCurrency,
  IbcCurrency,
} from "@repo/flame-types";
import { sendIbcTransfer } from "features/cosmos-wallet";
import {
  createAstriaBridgeSourceService,
  createErc20Service,
  createWithdrawerService,
} from "features/evm-wallet";

import { ChainConnection } from "../types";

export interface BridgeStrategy {
  execute(recipientAddress: Address): Promise<void>;
}

/**
 * Unified context that contains all possible parameters
 * needed by any strategy implementation.
 *
 * FIXME: This approach has a drawback of passing potentially unused properties
 *  to strategies that don't need them. Consider refactoring.
 */
export interface BridgeStrategyContext {
  // Common properties
  amount: string;
  sourceConnection: ChainConnection;

  // Cosmos-specific properties
  cosmosWallet: {
    getCosmosSigningClient: () => Promise<SigningStargateClient>;
  };

  // EVM-specific properties
  wagmiConfig: Config;
}

/**
 * Implementation of Intent Bridge strategy (EVM to EVM)
 */
export class EvmIntentBridgeStrategy implements BridgeStrategy {
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
        "Source chain, currency, and address are required to create a deposit strategy.",
      );
    }

    this.wagmiConfig = context.wagmiConfig;
    this.amount = context.amount;
    this.sourceChain = context.sourceConnection.chain as EvmChainInfo;
    this.sourceCurrency = context.sourceConnection.currency as EvmCurrency;
  }

  async execute(recipientAddress: Address): Promise<void> {
    if (!this.sourceCurrency.erc20ContractAddress) {
      throw new Error(
        "ERC20 contract address is missing for the selected token. Intent bridge only supports ERC20 tokens.",
      );
    }
    if (!this.sourceCurrency.astriaIntentBridgeAddress) {
      throw new Error("Intent bridge contract not configured for this token.");
    }

    // parse amount format based on decimals
    const parsedAmount = parseUnits(
      this.amount,
      this.sourceCurrency.coinDecimals,
    );

    // approve the bridge contract to spend tokens
    // TODO - replace this logic by using useTokenApproval in
    //  content-section
    const erc20Service = createErc20Service(
      this.wagmiConfig,
      this.sourceCurrency.erc20ContractAddress,
    );
    await erc20Service.approveToken(
      this.sourceChain.chainId,
      this.sourceCurrency.astriaIntentBridgeAddress,
      this.amount,
      this.sourceCurrency.coinDecimals,
    );

    // handle bridging via AstriaBridgeSourceService
    const bridgeService = createAstriaBridgeSourceService(
      this.wagmiConfig,
      this.sourceCurrency.astriaIntentBridgeAddress,
    );
    await bridgeService.bridgeTokens({
      recipientAddress,
      amount: parsedAmount,
      chainId: this.sourceChain.chainId,
    });
  }
}

/**
 * Implementation of IBC Bridge deposit strategy (Cosmos to Astria)
 */
export class CosmosIbcDepositStrategy implements BridgeStrategy {
  private cosmosWallet: BridgeStrategyContext["cosmosWallet"];
  private amount: string;
  private readonly sourceAddress: string;
  private readonly sourceChain: CosmosChainInfo;
  private readonly sourceCurrency: IbcCurrency;

  constructor(context: BridgeStrategyContext) {
    const {
      sourceConnection: { address, chain, currency },
    } = context;
    if (!address || !chain || !currency) {
      throw new Error(
        "Source chain, currency, and address are required to create a deposit strategy.",
      );
    }
    if (!context.cosmosWallet) {
      throw new Error(
        "Cosmos wallet is required for Cosmos IBC deposit strategy.",
      );
    }

    this.cosmosWallet = context.cosmosWallet;
    this.amount = context.amount;
    this.sourceAddress = address;
    this.sourceChain = chain as CosmosChainInfo;
    this.sourceCurrency = currency as IbcCurrency;
  }

  async execute(recipientAddress: Address): Promise<void> {
    if (!this.sourceChain || !this.sourceCurrency) {
      throw new Error(
        "Please select a Cosmos chain and token to bridge first.",
      );
    }

    const formattedAmount = Decimal.fromUserInput(
      this.amount,
      this.sourceCurrency.coinDecimals,
    ).atomics;

    const signer = await this.cosmosWallet.getCosmosSigningClient();
    await sendIbcTransfer(
      signer,
      this.sourceAddress,
      recipientAddress,
      formattedAmount,
      this.sourceCurrency,
    );
  }
}

/**
 * Implementation of IBC Withdraw strategy (Astria to Cosmos)
 */
export class AstriaIbcWithdrawStrategy implements BridgeStrategy {
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
        "Source chain, currency, and address are required to create a withdraw strategy.",
      );
    }

    this.wagmiConfig = context.wagmiConfig;
    this.amount = context.amount;
    this.sourceChain = chain as EvmChainInfo;
    this.sourceCurrency = currency as EvmCurrency;
  }

  async execute(recipientAddress: Address): Promise<void> {
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
 * Creates the appropriate bridge strategy based on source and destination chain types
 */
export function createBridgeStrategy(
  context: BridgeStrategyContext,
  destinationChainType?: ChainType,
): BridgeStrategy {
  const { sourceConnection } = context;
  const sourceChainType = sourceConnection.chain?.chainType;

  // For deposits (to Astria)
  if (!destinationChainType || destinationChainType === ChainType.ASTRIA) {
    switch (sourceChainType) {
      case ChainType.COSMOS:
        return new CosmosIbcDepositStrategy(context);
      case ChainType.EVM:
        return new EvmIntentBridgeStrategy(context);
      default:
        throw new Error(
          `Error creating deposit strategy. No source chain selected or unsupported source chain type: ${sourceChainType}.`,
        );
    }
  }

  // For withdrawals (from Astria)
  if (sourceChainType === ChainType.ASTRIA) {
    switch (destinationChainType) {
      case ChainType.COSMOS:
        return new AstriaIbcWithdrawStrategy(context);
      case ChainType.EVM:
        return new EvmIntentBridgeStrategy(context);
      default:
        throw new Error(
          `Error creating withdraw strategy. Unsupported destination chain type: ${destinationChainType}.`,
        );
    }
  }

  throw new Error(
    `Unsupported bridge direction: from ${sourceChainType} to ${destinationChainType}.`,
  );
}
