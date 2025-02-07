import JSBI from "jsbi";
import { Chain, encodeFunctionData, PublicClient, WalletClient } from "viem";

import { GetQuoteResult } from "@repo/flame-types";
import ERC_20_ABI from "./contracts/erc20.json";
import SWAP_ROUTER_ABI from "./contracts/swaprouter02.json";
import {
  ExactInputParams,
  ExactInputSingleParams,
  ExactOutputParams,
  ExactOutputSingleParams,
  Pool,
  Route,
  SwapOptions,
  Token,
  TokenAmount,
  Trade,
  TradeType,
} from "./types";

export class SwapRouter {
  private readonly routerAddress: `0x${string}`;
  private readonly chainConfig: Chain;
  private readonly routerAbi: Array<{
    name: string;
    type: string;
    inputs: Array<{
      name: string;
      type: string;
      components?: Array<{ name: string; type: string }>;
    }>;
    outputs: Array<{ name: string; type: string }>;
    stateMutability: string;
  }>;
  private readonly erc20Abi: Array<{
    name: string;
    type: string;
    inputs: Array<{
      name: string;
      type: string;
      components?: Array<{ name: string; type: string }>;
    }>;
    outputs: Array<{ name: string; type: string }>;
    stateMutability: string;
  }>;

  constructor(routerAddress: string, chainConfig: Chain) {
    this.routerAddress = routerAddress as `0x${string}`;
    this.chainConfig = chainConfig;
    // Minimal ABI for the swap functions.
    this.routerAbi = SWAP_ROUTER_ABI;
    this.erc20Abi = ERC_20_ABI;
  }

  private calculateMinimumOut(
    amount: TokenAmount,
    slippageTolerance: number,
  ): JSBI {
    slippageTolerance = slippageTolerance * 100;
    const slippagePercent = JSBI.BigInt(10000 - slippageTolerance);
    const minimumAmount = JSBI.divide(
      JSBI.multiply(amount.raw, slippagePercent),
      JSBI.BigInt(10000),
    );

    console.log("MinimumOut calculation:", {
      amount: amount.raw.toString(),
      slippageTolerance,
      minimumAmount: minimumAmount.toString(),
    });

    return minimumAmount;
  }

  private calculateMaximumIn(
    amount: TokenAmount,
    slippageTolerance: number,
  ): JSBI {
    slippageTolerance = slippageTolerance * 100;
    const slippagePercent = JSBI.BigInt(10000 + slippageTolerance);
    const maximumAmount = JSBI.divide(
      JSBI.multiply(amount.raw, slippagePercent),
      JSBI.BigInt(10000),
    );

    console.log("MaximumIn calculation:", {
      amount: amount.raw.toString(),
      slippageTolerance,
      maximumAmount: maximumAmount.toString(),
    });

    return maximumAmount;
  }

  private calculateSlippage(
    amount: JSBI,
    slippageTolerance: number,
    isMinimum: boolean,
  ): JSBI {
    slippageTolerance = slippageTolerance * 100;
    const basisPoints = JSBI.BigInt(10000);
    let adjustedBasisPoints: JSBI;

    if (isMinimum) {
      adjustedBasisPoints = JSBI.BigInt(10000 - slippageTolerance);
    } else {
      adjustedBasisPoints = JSBI.BigInt(10000 + slippageTolerance);
    }

    return JSBI.divide(JSBI.multiply(amount, adjustedBasisPoints), basisPoints);
  }

  /**
   * Checks the token allowance and, if needed, sends an approval transaction.
   *
   * @param token - The ERC20 token to approve.
   * @param amount - The required amount (as a JSBI).
   * @param walletClient - The connected wallet client (from wagmi/viem).
   * @param publicClient - The public client for reading blockchain data.
   */
  private async approveTokenIfNeeded(
    token: Token,
    amount: JSBI,
    walletClient: WalletClient,
    publicClient: PublicClient,
  ): Promise<void> {
    const signerAddress = walletClient?.account?.address as `0x${string}`;
    // Use the public client to read the allowance.
    const currentAllowance = (await publicClient.readContract({
      address: token.address as `0x${string}`,
      abi: this.erc20Abi,
      functionName: "allowance",
      args: [signerAddress, this.routerAddress],
    })) as bigint;

    if (JSBI.GT(amount, JSBI.BigInt(currentAllowance.toString()))) {
      console.log("Approving token...");
      // Use the wallet client to send the approval transaction.
      const txHash = await walletClient.writeContract({
        address: token.address as `0x${string}`,
        abi: this.erc20Abi,
        functionName: "approve",
        args: [this.routerAddress, amount.toString()],
        value: 0n,
        chain: this.chainConfig,
        account: walletClient?.account?.address as `0x${string}`,
      });
      // Optionally wait for confirmation.
      console.log("Token approved. Tx hash:", txHash);
    } else {
      console.log("Token already approved");
    }
  }

  private getExactInputParams(
    trade: Trade,
    recipient: `0x${string}`,
    slippageTolerance: number,
    deadline: bigint,
    isETHOut: boolean,
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
            recipient: isETHOut ? this.routerAddress : recipient,
            amountIn: BigInt(trade.inputAmount.raw.toString()),
            amountOutMinimum: BigInt(
              this.calculateMinimumOut(
                trade.outputAmount,
                slippageTolerance,
              ).toString(),
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
          recipient: isETHOut ? this.routerAddress : recipient,
          amountIn: BigInt(trade.inputAmount.raw.toString()),
          amountOutMinimum: BigInt(
            this.calculateMinimumOut(
              trade.outputAmount,
              slippageTolerance,
            ).toString(),
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
    isETHOut: boolean,
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
            recipient: isETHOut ? this.routerAddress : recipient,
            amountOut: BigInt(trade.outputAmount.raw.toString()),
            amountInMaximum: BigInt(
              this.calculateMaximumIn(
                trade.inputAmount,
                slippageTolerance,
              ).toString(),
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
          recipient: isETHOut ? this.routerAddress : recipient,
          amountOut: BigInt(trade.outputAmount.raw.toString()),
          amountInMaximum: BigInt(
            this.calculateMaximumIn(
              trade.inputAmount,
              slippageTolerance,
            ).toString(),
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
   * @param trade - The trade details.
   * @param options - Swap options such as recipient, slippage, and deadline.
   * @param walletClient - The connected wallet client (from wagmi/viem).
   * @param publicClient - The public client for reading blockchain data.
   * @returns The transaction hash if successful.
   */
  async executeSwap(
    trade: Trade,
    options: SwapOptions,
    walletClient: WalletClient,
    publicClient: PublicClient,
  ): Promise<`0x${string}` | undefined> {
    // FIXME - we're depending on the fact that the usage of `getQuote` doesn't change the symbol
    //  to wtia when getting an estimate for wtia to show in the ui
    const isNativeIn =
      trade.inputAmount.token.symbol.toLocaleLowerCase() === "tia";
    const isNativeOut =
      trade.outputAmount.token.symbol.toLocaleLowerCase() === "tia";

    // A default gas limit in case estimation fails.
    const DEFAULT_GAS_LIMIT = 250000n;
    const signerAddress = walletClient?.account?.address as `0x${string}`;

    if (!isNativeIn) {
      if (trade.type === TradeType.EXACT_INPUT) {
        await this.approveTokenIfNeeded(
          trade.inputAmount.token,
          trade.inputAmount.raw,
          walletClient,
          publicClient,
        );
      } else {
        await this.approveTokenIfNeeded(
          trade.inputAmount.token,
          this.calculateMaximumIn(trade.inputAmount, options.slippageTolerance),
          walletClient,
          publicClient,
        );
      }
    }

    // get swap parameters based on trade type
    const swapParams =
      trade.type === TradeType.EXACT_INPUT
        ? this.getExactInputParams(
            trade,
            options.recipient,
            options.slippageTolerance,
            options.deadline,
            isNativeOut,
          )
        : this.getExactOutputParams(
            trade,
            options.recipient,
            options.slippageTolerance,
            options.deadline,
            isNativeOut,
          );

    // for simple erc20 token swaps
    if (!isNativeIn && !isNativeOut) {
      console.log("Executing simple erc20 swap...");
      const amount = trade.inputAmount.raw.toString();
      let gasLimit: bigint;
      try {
        gasLimit = await publicClient.estimateContractGas({
          address: this.routerAddress,
          abi: this.routerAbi,
          functionName: swapParams.functionName,
          args: swapParams.args,
          account: signerAddress,
          value: BigInt(amount),
        });
      } catch (err) {
        console.error("Gas estimation failed, using default limit", err);
        gasLimit = DEFAULT_GAS_LIMIT;
      }
      // Increase the estimated gas by 20%
      gasLimit = (gasLimit * 120n) / 100n;

      // Send the transaction via the connected wallet's writeContract method.
      return await walletClient.writeContract({
        address: this.routerAddress,
        abi: this.routerAbi,
        functionName: swapParams.functionName,
        args: swapParams.args,
        value: BigInt(amount),
        gas: gasLimit,
        chain: this.chainConfig,
        account: signerAddress,
      });
    }

    const calls: string[] = [];
    let value = 0n;

    // add wrapETH call if needed
    if (isNativeIn) {
      calls.push(this.encodeWrapETHCall(trade.inputAmount.raw.toString()));
      value = BigInt(trade.inputAmount.raw.toString());
    }

    // add swap
    calls.push(this.encodeSwapCall(swapParams.functionName, swapParams.args));

    // add unwrapWETH if needed
    if (isNativeOut) {
      const minimumAmount = this.calculateSlippage(
        trade.type === TradeType.EXACT_INPUT
          ? trade.outputAmount.raw
          : trade.outputAmount.raw,
        options.slippageTolerance,
        true,
      ).toString();

      calls.push(this.encodeUnwrapWETHCall(minimumAmount));
    }

    return await walletClient.writeContract({
      address: this.routerAddress,
      abi: this.routerAbi,
      functionName: "multicall",
      args: [calls],
      value,
      // gas: DEFAULT_GAS_LIMIT,
      chain: this.chainConfig,
      account: signerAddress,
    });
  }

  private encodeWrapETHCall(value: string): string {
    return encodeFunctionData({
      abi: this.routerAbi,
      functionName: "wrapETH",
      args: [BigInt(value)],
    });
  }

  private encodeUnwrapWETHCall(minimumAmount: string): string {
    return encodeFunctionData({
      abi: this.routerAbi,
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
      abi: this.routerAbi,
      functionName,
      args,
    });
  }
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
  console.log("quoteResult", quoteResult);
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

    return new Trade(route, inputAmount, outputAmount, TradeType.EXACT_INPUT);
  } else {
    const inputAmount = new TokenAmount(inputToken, quoteResult.quote);
    const outputAmount = new TokenAmount(outputToken, quoteResult.amount);

    return new Trade(route, inputAmount, outputAmount, TradeType.EXACT_OUTPUT);
  }
}
