// swapRouter.ts
import JSBI from "jsbi";
import { GetQuoteResult } from "@repo/ui/types";
import { Chain, PublicClient, WalletClient } from "viem";

// Define a zero address constant for ETH
export const ZeroAddress = "0x0000000000000000000000000000000000000000";

// =================== Core Types ===================

export enum TradeType {
  EXACT_INPUT,
  EXACT_OUTPUT,
}

export class Token {
  readonly chainId: number;
  readonly address: string;
  readonly decimals: number;
  readonly symbol: string;

  constructor(
    chainId: number,
    address: string,
    decimals: number,
    symbol: string
  ) {
    this.chainId = chainId;
    this.address = address;
    this.decimals = decimals;
    this.symbol = symbol;
  }

  equals(other: Token): boolean {
    return (
      this.chainId === other.chainId &&
      this.address.toLowerCase() === other.address.toLowerCase()
    );
  }
}

export class TokenAmount {
  readonly token: Token;
  readonly raw: JSBI;
  readonly decimalScale: JSBI;

  constructor(token: Token, amount: string | JSBI) {
    this.token = token;
    this.decimalScale = JSBI.exponentiate(
      JSBI.BigInt(10),
      JSBI.BigInt(token.decimals)
    );
    this.raw = typeof amount === "string" ? JSBI.BigInt(amount) : amount;
  }
}

export interface Pool {
  token0: Token;
  token1: Token;
  fee: number;
  sqrtRatioX96?: string;
  liquidity?: string;
  tickCurrent?: number;
}

export class Route {
  readonly pools: Pool[];
  readonly path: Token[];
  readonly input: Token;
  readonly output: Token;

  constructor(pools: Pool[], input: Token, output: Token) {
    this.pools = pools;
    this.input = input;
    this.output = output;

    // Build the token path from the pools.
    this.path = pools.reduce<Token[]>((tokens, pool) => {
      if (tokens.length === 0) {
        tokens.push(pool.token0.equals(input) ? pool.token0 : pool.token1);
      }
      const lastToken = tokens[tokens.length - 1];
      const tokenOut = lastToken?.equals(pool.token0)
        ? pool.token1
        : pool.token0;
      tokens.push(tokenOut);
      return tokens;
    }, []);

    if (this.path[0]?.address !== input.address) {
      throw new Error("First token in path must match input token");
    }
    if (this.path[this.path.length - 1]?.address !== output.address) {
      throw new Error("Last token in path must match output token");
    }
  }
}

export class Trade {
  readonly route: Route;
  readonly type: TradeType;
  readonly inputAmount: TokenAmount;
  readonly outputAmount: TokenAmount;

  constructor(
    route: Route,
    inputAmount: TokenAmount,
    outputAmount: TokenAmount,
    type: TradeType
  ) {
    this.route = route;
    this.type = type;
    this.inputAmount = inputAmount;
    this.outputAmount = outputAmount;
  }
}

export interface SwapOptions {
  recipient: string;
  slippageTolerance: number; // in basis points (e.g. 50 = 0.5%)
  deadline: number;
}

// =================== SwapRouter Class ===================

export class SwapRouter {
  private routerAddress: `0x${string}`;
  private chainConfig: Chain;
  private routerAbi: Array<{
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
    this.routerAbi = [
      {
        name: "exactInputSingle",
        type: "function",
        inputs: [
          {
            name: "params",
            type: "tuple",
            components: [
              { name: "tokenIn", type: "address" },
              { name: "tokenOut", type: "address" },
              { name: "fee", type: "uint24" },
              { name: "recipient", type: "address" },
              { name: "amountIn", type: "uint256" },
              { name: "amountOutMinimum", type: "uint256" },
              { name: "sqrtPriceLimitX96", type: "uint160" },
            ],
          },
        ],
        outputs: [{ name: "amountOut", type: "uint256" }],
        stateMutability: "payable",
      },
      {
        name: "exactInput",
        type: "function",
        inputs: [
          {
            name: "params",
            type: "tuple",
            components: [
              { name: "path", type: "bytes" },
              { name: "recipient", type: "address" },
              { name: "amountIn", type: "uint256" },
              { name: "amountOutMinimum", type: "uint256" },
            ],
          },
        ],
        outputs: [{ name: "amountOut", type: "uint256" }],
        stateMutability: "payable",
      },
      {
        name: "exactOutputSingle",
        type: "function",
        inputs: [
          {
            name: "params",
            type: "tuple",
            components: [
              { name: "tokenIn", type: "address" },
              { name: "tokenOut", type: "address" },
              { name: "fee", type: "uint24" },
              { name: "recipient", type: "address" },
              { name: "amountOut", type: "uint256" },
              { name: "amountInMaximum", type: "uint256" },
              { name: "sqrtPriceLimitX96", type: "uint160" },
            ],
          },
        ],
        outputs: [{ name: "amountIn", type: "uint256" }],
        stateMutability: "payable",
      },
      {
        name: "exactOutput",
        type: "function",
        inputs: [
          {
            name: "params",
            type: "tuple",
            components: [
              { name: "path", type: "bytes" },
              { name: "recipient", type: "address" },
              { name: "amountOut", type: "uint256" },
              { name: "amountInMaximum", type: "uint256" },
            ],
          },
        ],
        outputs: [{ name: "amountIn", type: "uint256" }],
        stateMutability: "payable",
      },
    ] as const;
  }

  private calculateMinimumOut(
    amount: TokenAmount,
    slippageTolerance: number
  ): JSBI {
    // slippageTolerance is in basis points (1 = 0.01%)
    const slippagePercent = JSBI.BigInt(10000 - slippageTolerance);
    const minimumAmount = JSBI.divide(
      JSBI.multiply(amount.raw, slippagePercent),
      JSBI.BigInt(10000)
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
    slippageTolerance: number
  ): JSBI {
    // slippageTolerance is in basis points (1 = 0.01%)
    const slippagePercent = JSBI.BigInt(10000 + slippageTolerance);
    const maximumAmount = JSBI.divide(
      JSBI.multiply(amount.raw, slippagePercent),
      JSBI.BigInt(10000)
    );

    console.log("MaximumIn calculation:", {
      amount: amount.raw.toString(),
      slippageTolerance,
      maximumAmount: maximumAmount.toString(),
    });

    return maximumAmount;
  }

  /**
   * Checks the token allowance and, if needed, sends an approval transaction.
   * @param token The ERC20 token to approve.
   * @param amount The required amount (as a JSBI).
   * @param walletClient The connected wallet client (from wagmi/viem).
   */
  private async approveTokenIfNeeded(
    token: Token,
    amount: JSBI,
    walletClient: WalletClient,
    publicClient: PublicClient
  ): Promise<void> {
    const erc20Abi = [
      {
        constant: false,
        inputs: [
          { name: "spender", type: "address" },
          { name: "amount", type: "uint256" },
        ],
        name: "approve",
        outputs: [{ name: "", type: "bool" }],
        type: "function",
      },
      {
        constant: true,
        inputs: [
          { name: "owner", type: "address" },
          { name: "spender", type: "address" },
        ],
        name: "allowance",
        outputs: [{ name: "", type: "uint256" }],
        type: "function",
      },
    ];

    const signerAddress = walletClient?.account?.address as `0x${string}`;
    // Use the public client to read the allowance.
    const currentAllowance = (await publicClient.readContract({
      address: token.address as `0x${string}`,
      abi: erc20Abi,
      functionName: "allowance",
      args: [signerAddress, this.routerAddress],
    })) as bigint;

    if (JSBI.GT(amount, JSBI.BigInt(currentAllowance.toString()))) {
      console.log("Approving token...");
      // Use the wallet client to send the approval transaction.
      const txHash = await walletClient.writeContract({
        address: token.address as `0x${string}`,
        abi: erc20Abi,
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

    return "0x" + encoded;
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

    return "0x" + encoded;
  }

  /**
   * Executes a swap using the connected wallet (via viem).
   * @param trade The trade details.
   * @param options Swap options such as recipient, slippage, and deadline.
   * @param walletClient The connected wallet client (from wagmi/viem).
   * @returns The transaction hash if successful.
   */
  async executeSwap(
    trade: Trade,
    options: SwapOptions,
    walletClient: WalletClient,
    publicClient: PublicClient
  ): Promise<string | undefined> {
    // A default gas limit in case estimation fails.
    const DEFAULT_GAS_LIMIT = 250000n;
    const signerAddress = walletClient?.account?.address as `0x${string}`;
    const value =
      trade.inputAmount.token.address === ZeroAddress
        ? trade.inputAmount.raw.toString()
        : "0";

    try {
      // Approve token if needed.
      if (trade.type === TradeType.EXACT_INPUT) {
        await this.approveTokenIfNeeded(
          trade.inputAmount.token,
          trade.inputAmount.raw,
          walletClient,
          publicClient
        );
      } else {
        await this.approveTokenIfNeeded(
          trade.inputAmount.token,
          this.calculateMaximumIn(trade.inputAmount, options.slippageTolerance),
          walletClient,
          publicClient
        );
      }

      // Determine whether the trade is multi-hop.
      const isMultiHop = trade.route.pools.length > 1;
      let functionName: string;
      let args: any[];

      if (trade.type === TradeType.EXACT_INPUT) {
        if (isMultiHop) {
          functionName = "exactInput";
          args = [
            {
              path: this.encodePath(trade.route),
              recipient: options.recipient,
              amountIn: trade.inputAmount.raw.toString(),
              amountOutMinimum: this.calculateMinimumOut(
                trade.outputAmount,
                options.slippageTolerance
              ).toString(),
            },
          ];
        } else if (
          trade.route.path[0] &&
          trade.route.path[1] &&
          trade.route.pools[0]
        ) {
          functionName = "exactInputSingle";
          args = [
            {
              tokenIn: trade.route.path[0].address,
              tokenOut: trade.route.path[1].address,
              fee: trade.route.pools[0].fee,
              recipient: options.recipient,
              amountIn: trade.inputAmount.raw.toString(),
              amountOutMinimum: this.calculateMinimumOut(
                trade.outputAmount,
                options.slippageTolerance
              ).toString(),
              sqrtPriceLimitX96: 0n,
            },
          ];
        } else {
          throw new Error("Invalid route for EXACT_INPUT trade");
        }
      } else {
        if (isMultiHop) {
          functionName = "exactOutput";
          args = [
            {
              path: this.encodePathReversed(trade.route),
              recipient: options.recipient,
              amountOut: trade.outputAmount.raw.toString(),
              amountInMaximum: this.calculateMaximumIn(
                trade.inputAmount,
                options.slippageTolerance
              ).toString(),
            },
          ];
        } else if (
          trade.route.path[0] &&
          trade.route.path[1] &&
          trade.route.pools[0]
        ) {
          functionName = "exactOutputSingle";
          args = [
            {
              tokenIn: trade.route.path[0].address,
              tokenOut: trade.route.path[1].address,
              fee: trade.route.pools[0].fee,
              recipient: options.recipient,
              amountOut: trade.outputAmount.raw.toString(),
              amountInMaximum: this.calculateMaximumIn(
                trade.inputAmount,
                options.slippageTolerance
              ).toString(),
              sqrtPriceLimitX96: 0n,
            },
          ];
        } else {
          throw new Error("Invalid route for EXACT_OUTPUT trade");
        }
      }

      console.log(`Debug ${functionName} parameters:`, {
        args,
        value,
        slippageTolerance: options.slippageTolerance,
      });

      // Estimate gas using the public client.
      let gasLimit: bigint;
      try {
        gasLimit = await publicClient.estimateContractGas({
          address: this.routerAddress,
          abi: this.routerAbi,
          functionName,
          args,
          account: signerAddress,
          value: BigInt(value),
        });
      } catch (err) {
        gasLimit = DEFAULT_GAS_LIMIT;
      }
      // Increase the estimated gas by 20%
      gasLimit = (gasLimit * 120n) / 100n;

      // Send the transaction via the connected wallet's writeContract method.
      const txHash = await walletClient.writeContract({
        address: this.routerAddress,
        abi: this.routerAbi,
        functionName,
        args,
        value: BigInt(value),
        gas: gasLimit,
        chain: this.chainConfig,
        account: signerAddress,
      });
      return txHash;
    } catch (error) {
      console.error("Swap failed:", error);
      throw error;
    }
  }
}

// =================== Trade Creation ===================

export function createTradeFromQuote(
  quoteResult: GetQuoteResult,
  type: "exactIn" | "exactOut"
): Trade {
  // Convert the first route from the quote.
  const routePools: Pool[] = (quoteResult.route[0] || []).map((poolRoute) => {
    return {
      token0: new Token(
        poolRoute.tokenIn.chainId,
        poolRoute.tokenIn.address,
        poolRoute.tokenIn.decimals,
        poolRoute.tokenIn.symbol
      ),
      token1: new Token(
        poolRoute.tokenOut.chainId,
        poolRoute.tokenOut.address,
        poolRoute.tokenOut.decimals,
        poolRoute.tokenOut.symbol
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
