import { Decimal } from "@cosmjs/math";
import { SigningStargateClient } from "@cosmjs/stargate";
import { parseUnits } from "viem";
import { Config } from "wagmi";

import {
  ChainType,
  CosmosChainInfo,
  EvmChainInfo,
  EvmCurrency,
  HexString,
  IbcCurrency,
} from "@repo/flame-types";
import { sendIbcTransfer } from "features/cosmos-wallet";
import { createErc20Service } from "features/evm-wallet";
import { createAstriaBridgeSourceService } from "features/evm-wallet/services/astria-bridge-source-service/astria-bridge-source-service";
import { ChainConnection } from "../../../types";

/**
 * Base deposit strategy interface
 */
export interface DepositStrategy {
  execute(recipientAddress: HexString): Promise<void>;
}

/**
 * Unified deposit context that contains all possible parameters
 * needed by any strategy implementation.
 *
 * FIXME: This approach has a drawback of passing potentially unused properties
 *  to strategies that don't need them. Consider refactoring.
 */
export interface DepositContext {
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
 * Implementation of IBC Bridge deposit strategy (Cosmos to Astria)
 */
export class CosmosIbcDepositStrategy implements DepositStrategy {
  private cosmosWallet: DepositContext["cosmosWallet"];
  private amount: string;
  private readonly sourceAddress: string;
  private readonly sourceChain: CosmosChainInfo;
  private readonly sourceCurrency: IbcCurrency;

  constructor(context: DepositContext) {
    const {
      sourceConnection: { address, chain, currency },
    } = context;
    if (!address || !chain || !currency) {
      throw new Error(
        "Source chain, currency, and address are required to create a deposit strategy",
      );
    }

    this.cosmosWallet = context.cosmosWallet;
    this.amount = context.amount;
    this.sourceAddress = address;
    this.sourceChain = chain as CosmosChainInfo;
    this.sourceCurrency = currency as IbcCurrency;
  }

  async execute(recipientAddress: HexString): Promise<void> {
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
 * Implementation of Intent Bridge deposit strategy (EVM to Astria)
 */
export class EvmIntentDepositStrategy implements DepositStrategy {
  private readonly wagmiConfig: Config;
  private readonly amount: string;
  private readonly sourceChain: EvmChainInfo;
  private readonly sourceCurrency: EvmCurrency;

  constructor(context: DepositContext) {
    const {
      sourceConnection: { address, chain, currency },
    } = context;
    if (!address || !chain || !currency) {
      throw new Error(
        "Source chain, currency, and address are required to create a deposit strategy",
      );
    }

    this.wagmiConfig = context.wagmiConfig;
    this.amount = context.amount;
    this.sourceChain = context.sourceConnection.chain as EvmChainInfo;
    this.sourceCurrency = context.sourceConnection.currency as EvmCurrency;
  }

  async execute(recipientAddress: HexString): Promise<void> {
    if (!this.sourceChain || !this.sourceCurrency) {
      throw new Error(
        "Please select a Coinbase chain and token to bridge first.",
      );
    }
    if (!this.sourceCurrency.erc20ContractAddress) {
      throw new Error(
        "ERC20 contract address is missing for the selected token. Intent bridge only supports ERC20 tokens.",
      );
    }
    if (
      !("astriaIntentBridgeAddress" in this.sourceCurrency) ||
      !this.sourceCurrency.astriaIntentBridgeAddress
    ) {
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
 * Creates the appropriate deposit strategy based on the source chain type
 */
export function createDepositStrategy(
  context: DepositContext,
): DepositStrategy {
  const { sourceConnection } = context;

  switch (sourceConnection.chain?.chainType) {
    case ChainType.COSMOS:
      return new CosmosIbcDepositStrategy(context);
    case ChainType.EVM:
      return new EvmIntentDepositStrategy(context);
    default:
      throw new Error(
        `Error creating deposit strategy. No source chain selected or unsupported source chain type: ${sourceConnection.chain?.chainType}`,
      );
  }
}
