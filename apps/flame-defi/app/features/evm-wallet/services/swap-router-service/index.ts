import { type Config, getPublicClient, getWalletClient } from "@wagmi/core";
import {
  Chain,
  encodeFunctionData,
  type Address,
  type PublicClient,
  type WalletClient,
  Abi,
} from "viem";
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

export class SwapRouterService extends GenericContractService {
  private readonly chainConfig: Chain;

  constructor(wagmiConfig: Config, routerAddress: Address, chainConfig: Chain) {
    super(wagmiConfig, routerAddress, SWAP_ROUTER_ABI as Abi);
    this.chainConfig = chainConfig;
  }

  private getExactInputParams(
    trade: Trade,
    recipient: `0x${string}`,
    slippageTolerance: number,
    deadline: bigint,
    isNativeOut: boolean,
  ): {
    functionName: "exactInputSingle" | "exactInput";
    args: readonly [ExactInputSingleParams] | readonly [ExactInputParams];
  } {
    const isMultiHop = trade.route.pools.length > 1;

    if (isMultiHop) {
      return {
        functionName: "exactInput",
        args: [
          {
            path: this.encodePath(trade.route),
            recipient: isNativeOut ? this.contractAddress : recipient,
            amountIn: BigInt(trade.inputAmount.raw.toString()),
            amountOutMinimum: BigInt(
              trade.outputAmount
                .withSlippage(slippageTolerance, true)
                .raw.toString(),
            ),
            deadline,
          },
        ],
      };
    }

    const tokenIn = trade.route.path[0]?.address as `0x${string}`;
    const tokenOut = trade.route.path[1]?.address as `0x${string}`;

    const fee = trade.route.pools[0]?.fee;
    if (!fee) {
      throw new Error("Fee not found in pool");
    }

    return {
      functionName: "exactInputSingle",
      args: [
        {
          tokenIn,
          tokenOut,
          fee,
          recipient: isNativeOut ? this.contractAddress : recipient,
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
    };
  }

  private getExactOutputParams(
    trade: Trade,
    recipient: `0x${string}`,
    slippageTolerance: number,
    deadline: bigint,
    isNativeOut: boolean,
  ): {
    functionName: "exactOutputSingle" | "exactOutput";
    args: readonly [ExactOutputSingleParams] | readonly [ExactOutputParams];
  } {
    const isMultiHop = trade.route.pools.length > 1;

    if (isMultiHop) {
      return {
        functionName: "exactOutput",
        args: [
          {
            path: this.encodePathReversed(trade.route),
            recipient: isNativeOut ? this.contractAddress : recipient,
            amountOut: BigInt(trade.outputAmount.raw.toString()),
            amountInMaximum: BigInt(
              trade.inputAmount
                .withSlippage(slippageTolerance, false)
                .raw.toString(),
            ),
            deadline,
          },
        ],
      };
    }

    const tokenIn = trade.route.path[0]?.address as `0x${string}`;
    const tokenOut = trade.route.path[1]?.address as `0x${string}`;

    const fee = trade.route.pools[0]?.fee;
    if (!fee) {
      throw new Error("Fee not found in pool");
    }

    return {
      functionName: "exactOutputSingle",
      args: [
        {
          tokenIn,
          tokenOut,
          fee,
          recipient: isNativeOut ? this.contractAddress : recipient,
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
    };
  }

  private encodePath(route: Route): `0x${string}` {
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

  private encodePathReversed(route: Route): `0x${string}` {
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
  ): Promise<`0x${string}`> {
    // A default gas limit in case estimation fails.
    const DEFAULT_GAS_LIMIT = 250000n;

    const walletClient = await this.getWalletClient(chainId);
    const publicClient = await this.getPublicClient(chainId);
    const signerAddress = walletClient.account?.address as `0x${string}`;

    // get swap parameters based on trade type
    const swapParams =
      trade.type === TRADE_TYPE.EXACT_IN
        ? this.getExactInputParams(
            trade,
            options.recipient,
            options.slippageTolerance,
            options.deadline,
            options.isNativeOut,
          )
        : this.getExactOutputParams(
            trade,
            options.recipient,
            options.slippageTolerance,
            options.deadline,
            options.isNativeOut,
          );

    // for simple erc20 token swaps
    if (!options.isNativeIn && !options.isNativeOut) {
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

    // add unwrapWETH if needed
    if (options.isNativeOut) {
      const minimumAmount = trade.outputAmount
        .withSlippage(options.slippageTolerance, true)
        .raw.toString();

      calls.push(this.encodeUnwrapWETHCall(minimumAmount));
    }

    return await this.writeContractMethod(chainId, "multicall", [calls], value);
  }

  private encodeUnwrapWETHCall(minimumAmount: string): string {
    return encodeFunctionData({
      abi: this.abi,
      functionName: "unwrapWETH9",
      args: [BigInt(minimumAmount)],
    });
  }

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
  ): `0x${string}` {
    return encodeFunctionData({
      abi: this.abi,
      functionName,
      args,
    });
  }

  /**
   * Helper to get the wallet client
   */
  private async getWalletClient(chainId: number): Promise<WalletClient> {
    const walletClient = await getWalletClient(this.wagmiConfig, { chainId });
    if (!walletClient) {
      throw new Error("No wallet client available");
    }
    return walletClient;
  }

  /**
   * Helper to get the public client
   */
  private async getPublicClient(chainId: number): Promise<PublicClient> {
    const publicClient = getPublicClient(this.wagmiConfig, { chainId });
    if (!publicClient) {
      throw new Error("No public client available");
    }
    return publicClient;
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
  ): Promise<`0x${string}`> {
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
    throw new Error("Invalid route: missing input or output token");
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
