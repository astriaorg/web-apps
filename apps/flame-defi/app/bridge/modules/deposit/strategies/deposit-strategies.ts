import { Decimal } from "@cosmjs/math";

import {
  ChainType,
  CosmosChainInfo,
  HexString,
  IbcCurrency,
} from "@repo/flame-types";
import { sendIbcTransfer } from "features/cosmos-wallet";
import {
  BridgeStrategy,
  BridgeStrategyContext,
  EvmIntentBridgeStrategy,
} from "../../../strategies";

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
 * Creates the appropriate deposit strategy based on the source chain type
 */
export function createDepositStrategy(
  context: BridgeStrategyContext,
): BridgeStrategy {
  const { sourceConnection } = context;

  switch (sourceConnection.chain?.chainType) {
    case ChainType.COSMOS:
      return new CosmosIbcDepositStrategy(context);
    case ChainType.EVM:
      return new EvmIntentBridgeStrategy(context);
    default:
      throw new Error(
        `Error creating deposit strategy. No source chain selected or unsupported source chain type: ${sourceConnection.chain?.chainType}`,
      );
  }
}
