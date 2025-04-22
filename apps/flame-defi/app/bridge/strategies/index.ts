import { EvmChainInfo, EvmCurrency, HexString } from "@repo/flame-types";
import { ChainConnection } from "../types";
import { SigningStargateClient } from "@cosmjs/stargate";
import { parseUnits } from "viem";
import { createErc20Service } from "../../features/evm-wallet";
import { Config } from "@wagmi/core";
import { createAstriaBridgeSourceService } from "features/evm-wallet";

export interface BridgeStrategy {
  execute(recipientAddress: HexString): Promise<void>;
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
        "Source chain, currency, and address are required to create a deposit strategy",
      );
    }

    this.wagmiConfig = context.wagmiConfig;
    this.amount = context.amount;
    this.sourceChain = context.sourceConnection.chain as EvmChainInfo;
    this.sourceCurrency = context.sourceConnection.currency as EvmCurrency;
  }

  async execute(recipientAddress: HexString): Promise<void> {
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
