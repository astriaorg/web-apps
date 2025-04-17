import { Decimal } from "@cosmjs/math";
import { SigningStargateClient } from "@cosmjs/stargate";
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

/**
 * Base deposit strategy interface
 */
export interface DepositStrategy {
  execute(recipientAddress: HexString): Promise<void>;
}

/**
 * Cosmos to Astria (IBC) deposit strategy
 */
export interface CosmosIbcDepositStrategyProps {
  cosmosWallet: {
    getCosmosSigningClient: () => Promise<SigningStargateClient>;
    cosmosAccountAddress: string | null;
    selectedCosmosChain: CosmosChainInfo | null;
    selectedIbcCurrency: IbcCurrency | null;
  };
  amount: string;
  selectedIbcCurrency: IbcCurrency | null;
  cosmosAccountAddress: string | null;
}

export class CosmosIbcDepositStrategy implements DepositStrategy {
  private cosmosWallet: CosmosIbcDepositStrategyProps["cosmosWallet"];
  private amount: string;
  private readonly selectedIbcCurrency: IbcCurrency | null;
  private readonly cosmosAccountAddress: string | null;

  constructor(props: CosmosIbcDepositStrategyProps) {
    this.cosmosWallet = props.cosmosWallet;
    this.amount = props.amount;
    this.selectedIbcCurrency = props.selectedIbcCurrency;
    this.cosmosAccountAddress = props.cosmosAccountAddress;
  }

  async execute(recipientAddress: HexString): Promise<void> {
    if (!this.cosmosWallet.selectedCosmosChain || !this.selectedIbcCurrency) {
      throw new Error(
        "Please select a Cosmos chain and token to bridge first.",
      );
    }

    const formattedAmount = Decimal.fromUserInput(
      this.amount,
      this.selectedIbcCurrency.coinDecimals,
    ).atomics;

    const signer = await this.cosmosWallet.getCosmosSigningClient();
    await sendIbcTransfer(
      signer,
      this.cosmosAccountAddress!,
      recipientAddress,
      formattedAmount,
      this.selectedIbcCurrency,
    );
  }
}

/**
 * EVM to Astria (Intent Bridge) deposit strategy
 */
export interface EvmIntentDepositStrategyProps {
  wagmiConfig: Config;
  sourceChain: EvmChainInfo;
  sourceCurrency: EvmCurrency;
  amount: string;
}

export class EvmIntentDepositStrategy implements DepositStrategy {
  private readonly wagmiConfig: Config;
  private readonly sourceChain: EvmChainInfo;
  private readonly sourceCurrency: EvmCurrency;
  private readonly amount: string;

  constructor(props: EvmIntentDepositStrategyProps) {
    this.wagmiConfig = props.wagmiConfig;
    this.sourceChain = props.sourceChain;
    this.sourceCurrency = props.sourceCurrency;
    this.amount = props.amount;
  }

  async execute(recipientAddress: HexString): Promise<void> {
    if (!this.sourceChain || !this.sourceCurrency) {
      throw new Error(
        "Please select a Coinbase chain and token to bridge first.",
      );
    }

    if (
      !("astriaIntentBridgeAddress" in this.sourceCurrency) ||
      !this.sourceCurrency.astriaIntentBridgeAddress
    ) {
      throw new Error("Intent bridge contract not configured for this token.");
    }

    // Convert amount to the proper format based on decimals
    const formattedAmount = BigInt(
      Math.floor(
        parseFloat(this.amount) * 10 ** this.sourceCurrency.coinDecimals,
      ).toString(),
    );

    // Handle bridging via AstriaBridgeSourceService
    if (this.sourceCurrency.erc20ContractAddress) {
      // Approve the bridge contract to spend tokens
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

      // Use intent bridge contract
      const bridgeService = createAstriaBridgeSourceService(
        this.wagmiConfig,
        this.sourceCurrency.astriaIntentBridgeAddress,
      );
      // Initiate transfer of the erc20 to AstriaBridgeSource
      await bridgeService.bridgeTokens({
        recipientAddress,
        amount: formattedAmount,
        chainId: this.sourceChain.chainId,
      });
    }
  }
}
