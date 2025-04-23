import { type Config } from "@wagmi/core";
import { Chain, encodeFunctionData, type Address, Abi, type Hash } from "viem";

import {
  GetQuoteResult,
  Token,
  TokenAmount,
  TRADE_TYPE,
} from "@repo/flame-types";
import SWAP_ROUTER_ABI from "./swaprouter02.json";
import {
  ExactInputParams,
  ExactInputSingleParams,
  ExactOutputParams,
  ExactOutputSingleParams,
  Pool,
  Route,
  SwapOptions,
  Trade,
} from "./types";
import { GenericContractService } from "../generic-contract-service";

// Default fee in basis points (25 bips = 0.25%)
// TODO - move to AppConfig
const DEFAULT_FEE_BIPS = 25n;

export class SwapRouterService extends GenericContractService {
  private readonly chainConfig: Chain;

  constructor(wagmiConfig: Config, routerAddress: Address, chainConfig: Chain) {
    super(wagmiConfig, routerAddress, SWAP_ROUTER_ABI as Abi);
    this.chainConfig = chainConfig;
  }

  private getExactInputParams(
    trade: Trade,
    options: SwapOptions,
    slippageTolerance: number,
    deadline: bigint,
  ): {
    functionName: "exactInputSingle" | "exactInput";
    args: readonly [ExactInputSingleParams] | readonly [ExactInputParams];
    isRequiresMulticall: boolean;
  } {
    const isMultiHop = trade.route.pools.length > 1;
    const recipient = this.determineRecipient(options);

    const isRequiresMulticall = Boolean(
      options.isNativeIn || options.isNativeOut || options.feeRecipient,
    );

    if (isMultiHop) {
      return {
        functionName: "exactInput",
        args: [
          {
            path: this.encodePath(trade.route),
            recipient,
            amountIn: BigInt(trade.inputAmount.raw.toString()),
            amountOutMinimum: BigInt(
              trade.outputAmount
                .withSlippage(slippageTolerance, true)
                .raw.toString(),
            ),
            deadline,
          },
        ],
        isRequiresMulticall,
      };
    }

    const tokenIn = trade.route.path[0]?.address as Address;
    const tokenOut = trade.route.path[1]?.address as Address;

    const fee = trade.route.pools[0]?.fee;
    if (!fee) {
      throw new Error("Fee not found in pool.");
    }

    return {
      functionName: "exactInputSingle",
      args: [
        {
          tokenIn,
          tokenOut,
          fee,
          recipient,
          amountIn: BigInt(trade.inputAmount.raw.toString()),
          amountOutMinimum: BigInt(
            trade.outputAmount
              .withSlippage(slippageTolerance, true)
              .raw.toString(),
          ),
          sqrtPriceLimitX96: 0n,
          deadline,
        },
      ],
      isRequiresMulticall,
    };
  }

  private getExactOutputParams(
    trade: Trade,
    options: SwapOptions,
    slippageTolerance: number,
    deadline: bigint,
  ): {
    functionName: "exactOutputSingle" | "exactOutput";
    args: readonly [ExactOutputSingleParams] | readonly [ExactOutputParams];
    isRequiresMulticall: boolean;
  } {
    const isMultiHop = trade.route.pools.length > 1;
    const recipient = this.determineRecipient(options);

    const isRequiresMulticall = Boolean(
      options.isNativeIn || options.isNativeOut || options.feeRecipient,
    );

    if (isMultiHop) {
      return {
        functionName: "exactOutput",
        args: [
          {
            path: this.encodePathReversed(trade.route),
            recipient,
            amountOut: BigInt(trade.outputAmount.raw.toString()),
            amountInMaximum: BigInt(
              trade.inputAmount
                .withSlippage(slippageTolerance, false)
                .raw.toString(),
            ),
            deadline,
          },
        ],
        isRequiresMulticall,
      };
    }

    const tokenIn = trade.route.path[0]?.address as Address;
    const tokenOut = trade.route.path[1]?.address as Address;

    const fee = trade.route.pools[0]?.fee;
    if (!fee) {
      throw new Error("Fee not found in pool.");
    }

    return {
      functionName: "exactOutputSingle",
      args: [
        {
          tokenIn,
          tokenOut,
          fee,
          recipient,
          amountOut: BigInt(trade.outputAmount.raw.toString()),
          amountInMaximum: BigInt(
            trade.inputAmount
              .withSlippage(slippageTolerance, false)
              .raw.toString(),
          ),
          sqrtPriceLimitX96: 0n,
          deadline,
        },
      ],
      isRequiresMulticall,
    };
  }

  private encodePath(route: Route): string {
    const encoded = route.pools
      .map((pool, i) => {
        const tokenIn = route.path[i];
        const tokenOut = route.path[i + 1];
        const fee = pool.fee.toString(16).padStart(6, "0");

        if (i === route.pools.length - 1) {
          return `${tokenIn?.address.toLowerCase().slice(2)}${fee}${tokenOut?.address.toLowerCase().slice(2)}`;
        }
        return `${tokenIn?.address.toLowerCase().slice(2)}${fee}`;
      })
      .join("");

    return `0x${encoded}`;
  }

  private encodePathReversed(route: Route): string {
    const encoded = [...route.pools]
      .reverse()
      .map((pool, i, reversedPools) => {
        const pathLength = route.path.length;
        const tokenIn = route.path[pathLength - 1 - i];
        const tokenOut = route.path[pathLength - 2 - i];
        const fee = pool.fee.toString(16).padStart(6, "0");

        if (i === reversedPools.length - 1) {
          return `${tokenIn?.address.toLowerCase().slice(2)}${fee}${tokenOut?.address.toLowerCase().slice(2)}`;
        }
        return `${tokenIn?.address.toLowerCase().slice(2)}${fee}`;
      })
      .join("");

    return `0x${encoded}`;
  }

  /**
   * Executes a swap using the connected wallet (via viem).
   *
   * @param chainId - The chain ID of the network
   * @param trade - The trade details.
   * @param options - Swap options such as recipient, slippage, and deadline.
   * @returns The transaction hash if successful.
   */
  async executeSwap(
    chainId: number,
    trade: Trade,
    options: SwapOptions,
  ): Promise<Hash> {
    // A default gas limit in case estimation fails.
    const DEFAULT_GAS_LIMIT = 250000n;

    const walletClient = await this.getWalletClient(chainId);
    const publicClient = await this.getPublicClient(chainId);
    const signerAddress = walletClient.account?.address as Address;

    // get swap parameters based on trade type
    const swapParams =
      trade.type === TRADE_TYPE.EXACT_IN
        ? this.getExactInputParams(
            trade,
            options,
            options.slippageTolerance,
            options.deadline,
          )
        : this.getExactOutputParams(
            trade,
            options,
            options.slippageTolerance,
            options.deadline,
          );

    // For simple erc20 token swaps with no fee recipient, we can use direct contract call
    // Otherwise, we need to use multicall to handle fees or token wraps/unwraps
    if (!swapParams.isRequiresMulticall) {
      let gasLimit: bigint;
      try {
        gasLimit = await publicClient.estimateContractGas({
          address: this.contractAddress,
          abi: this.abi,
          functionName: swapParams.functionName,
          args: swapParams.args,
          account: signerAddress,
          value: BigInt(0),
        });
      } catch (err) {
        console.error("Gas estimation failed, using default limit", err);
        gasLimit = DEFAULT_GAS_LIMIT;
      }
      // Increase the estimated gas by 20%
      gasLimit = (gasLimit * 120n) / 100n;

      // Send the transaction via the connected wallet's writeContract method.
      return await this.writeContractMethodWithGas(
        chainId,
        swapParams.functionName,
        swapParams.args,
        BigInt(0),
        gasLimit,
      );
    }

    const calls: string[] = [];
    let value = 0n;

    if (options.isNativeIn) {
      // if isNativeIn then we need to send TIA to the contract, so set the value accordingly
      // NOTE - we don't need to explicitly wrap ETH for native input like we do for native output,
      //  the router's callback will do it for us
      value = BigInt(trade.inputAmount.raw.toString());
    }

    // add swap
    calls.push(this.encodeSwapCall(swapParams.functionName, swapParams.args));

    // add unwrap WETH or sweepTokenWithFee if needed
    if (options.isNativeOut) {
      const minimumAmount = trade.outputAmount
        .withSlippage(options.slippageTolerance, true)
        .raw.toString();

      if (options.feeRecipient) {
        // unwrapWETH9WithFee to take fee on native token output
        calls.push(
          this.encodeUnwrapWETHWithFeeCall(
            minimumAmount,
            options.recipient,
            options.feeRecipient,
          ),
        );
      } else {
        // use regular unwrapWETH9 with no fee
        calls.push(this.encodeUnwrapWETHCall(minimumAmount));
      }
    } else if (options.feeRecipient) {
      // if we have a fee recipient but not native output, use sweepTokenWithFee
      const tokenOut = trade.route.path[trade.route.path.length - 1]
        ?.address as Address;
      const minimumAmount = trade.outputAmount
        .withSlippage(options.slippageTolerance, true)
        .raw.toString();

      calls.push(
        this.encodeSweepTokenWithFeeCall(
          tokenOut,
          minimumAmount,
          options.recipient,
          options.feeRecipient,
        ),
      );
    }

    return await this.writeContractMethod(chainId, "multicall", [calls], value);
  }

  /**
   * Encodes an unwrapWETH9 function call to be used in a multicall transaction.
   * This method is used to unwrap WETH (wrapped native token) back to the native token (e.g., ETH, TIA)
   * without taking a fee.
   */
  private encodeUnwrapWETHCall(minimumAmount: string): string {
    return encodeFunctionData({
      abi: this.abi,
      functionName: "unwrapWETH9",
      args: [BigInt(minimumAmount)],
    });
  }

  /**
   * Encodes an unwrapWETH9WithFee function call to be used in a multicall transaction.
   * This method is used when collecting fees on native token outputs (e.g., ETH, TIA).
   */
  private encodeUnwrapWETHWithFeeCall(
    minimumAmount: string,
    recipient: Address,
    feeRecipient: Address,
  ): string {
    return encodeFunctionData({
      abi: this.abi,
      functionName: "unwrapWETH9WithFee",
      args: [BigInt(minimumAmount), recipient, DEFAULT_FEE_BIPS, feeRecipient],
    });
  }

  /**
   * Encodes a sweepTokenWithFee function call to be used in a multicall transaction.
   * This method is used when collecting fees on token outputs that are not native tokens.
   */
  private encodeSweepTokenWithFeeCall(
    token: Address,
    minimumAmount: string,
    recipient: Address,
    feeRecipient: Address,
  ): string {
    return encodeFunctionData({
      abi: this.abi,
      functionName: "sweepTokenWithFee",
      args: [
        token,
        BigInt(minimumAmount),
        recipient,
        DEFAULT_FEE_BIPS,
        feeRecipient,
      ],
    });
  }

  /**
   * Determines the appropriate recipient address based on swap options.
   */
  private determineRecipient(options: SwapOptions): Address {
    // For native output or when a fee recipient is specified,
    // we need to send to the router first
    if (options.isNativeOut || options.feeRecipient) {
      return this.contractAddress;
    }

    // Otherwise we can send directly to the recipient
    return options.recipient;
  }

  /**
   * Encodes a swap function call to be used in a multicall transaction.
   */
  private encodeSwapCall(
    functionName:
      | "exactInputSingle"
      | "exactInput"
      | "exactOutputSingle"
      | "exactOutput",
    args:
      | readonly [ExactInputSingleParams]
      | readonly [ExactInputParams]
      | readonly [ExactOutputSingleParams]
      | readonly [ExactOutputParams],
  ): string {
    return encodeFunctionData({
      abi: this.abi,
      functionName,
      args,
    });
  }

  /**
   * Extended write contract method that allows specifying gas
   */
  private async writeContractMethodWithGas(
    chainId: number,
    methodName: string,
    args:
      | readonly [ExactInputSingleParams]
      | readonly [ExactInputParams]
      | readonly [ExactOutputSingleParams]
      | readonly [ExactOutputParams],
    value?: bigint,
    gas?: bigint,
  ): Promise<Hash> {
    const walletClient = await this.getWalletClient(chainId);

    try {
      return await walletClient.writeContract({
        address: this.contractAddress,
        abi: this.abi,
        functionName: methodName,
        args,
        value,
        gas,
        chain: this.chainConfig,
        account: walletClient.account?.address ?? null,
      });
    } catch (e) {
      console.error(`Error in ${methodName}:`, e);
      throw e;
    }
  }
}

/**
 * Factory function to create a SwapRouterService
 */
export function createSwapRouterService(
  wagmiConfig: Config,
  routerAddress: Address,
  chainConfig: Chain,
): SwapRouterService {
  return new SwapRouterService(wagmiConfig, routerAddress, chainConfig);
}

/**
 * Creates a Trade from a GetQuoteResult
 * @param quoteResult
 * @param type
 */
export function createTradeFromQuote(
  quoteResult: GetQuoteResult,
  type: "exactIn" | "exactOut",
): Trade {
  // Convert the first route from the quote.
  // TODO - find best route
  const routePools: Pool[] = (quoteResult.route[0] || []).map((poolRoute) => {
    return {
      token0: new Token(
        poolRoute.tokenIn.chainId,
        poolRoute.tokenIn.address,
        poolRoute.tokenIn.decimals,
        poolRoute.tokenIn.symbol,
      ),
      token1: new Token(
        poolRoute.tokenOut.chainId,
        poolRoute.tokenOut.address,
        poolRoute.tokenOut.decimals,
        poolRoute.tokenOut.symbol,
      ),
      fee: parseInt(poolRoute.fee),
      sqrtRatioX96: poolRoute.sqrtRatioX96,
      liquidity: poolRoute.liquidity,
      tickCurrent: parseInt(poolRoute.tickCurrent),
    };
  });

  // Determine input and output tokens from the route.
  const inputToken = routePools[0]?.token0;
  const outputToken = routePools[routePools.length - 1]?.token1;

  if (!inputToken || !outputToken) {
    throw new Error("Invalid route: missing input or output token.");
  }

  const route = new Route(routePools, inputToken, outputToken);

  if (type === "exactIn") {
    const inputAmount = new TokenAmount(inputToken, quoteResult.amount);
    const outputAmount = new TokenAmount(outputToken, quoteResult.quote);

    return new Trade(route, inputAmount, outputAmount, TRADE_TYPE.EXACT_IN);
  } else {
    const inputAmount = new TokenAmount(inputToken, quoteResult.quote);
    const outputAmount = new TokenAmount(outputToken, quoteResult.amount);

    return new Trade(route, inputAmount, outputAmount, TRADE_TYPE.EXACT_OUT);
  }
}
