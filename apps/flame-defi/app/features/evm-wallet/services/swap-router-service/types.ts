import { Token, TokenAmount, TRADE_TYPE } from "@repo/flame-types";

/**
 * Parameters for the exactInputSingle method
 */
export interface ExactInputSingleParams {
  tokenIn: `0x${string}`;
  tokenOut: `0x${string}`;
  fee: number;
  recipient: `0x${string}`;
  amountIn: bigint;
  amountOutMinimum: bigint;
  sqrtPriceLimitX96: bigint;
  deadline: bigint;
}

/**
 * Parameters for the exactInput method
 */
export interface ExactInputParams {
  path: `0x${string}`;
  recipient: `0x${string}`;
  amountIn: bigint;
  amountOutMinimum: bigint;
  deadline: bigint;
}

/**
 * Parameters for the exactOutputSingle method
 */
export interface ExactOutputSingleParams {
  tokenIn: `0x${string}`;
  tokenOut: `0x${string}`;
  fee: number;
  recipient: `0x${string}`;
  amountOut: bigint;
  amountInMaximum: bigint;
  sqrtPriceLimitX96: bigint;
  deadline: bigint;
}

/**
 * Parameters for the exactOutput method
 */
export interface ExactOutputParams {
  path: `0x${string}`;
  recipient: `0x${string}`;
  amountOut: bigint;
  amountInMaximum: bigint;
  deadline: bigint;
}

/**
 * A pool represents a liquidity pool for a pair of tokens.
 */
export interface Pool {
  token0: Token;
  token1: Token;
  fee: number;
  sqrtRatioX96?: string;
  liquidity?: string;
  tickCurrent?: number;
}

/**
 * A route represents a path of pools through which a swap can occur.
 */
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

/**
 * A trade represents a swap of one token for another.
 */
export class Trade {
  readonly route: Route;
  readonly type: TRADE_TYPE;
  readonly inputAmount: TokenAmount;
  readonly outputAmount: TokenAmount;

  constructor(
    route: Route,
    inputAmount: TokenAmount,
    outputAmount: TokenAmount,
    type: TRADE_TYPE,
  ) {
    this.route = route;
    this.type = type;
    this.inputAmount = inputAmount;
    this.outputAmount = outputAmount;
  }
}

/**
 * Options for a swap.
 */
export interface SwapOptions {
  /**
   * The address of the recipient of the swap.
   */
  recipient: `0x${string}`;
  /**
   * The maximum acceptable slippage tolerance for the swap, expressed as a percentage.
   * For example, a value of 0.1 means a 0.1% slippage tolerance.
   */
  slippageTolerance: number;
  /**
   * The deadline for the swap, expressed as a timestamp.
   */
  deadline: bigint;
  /**
   * True when input token is native.
   */
  isNativeIn: boolean;
  /**
   * True when output token is native.
   */
  isNativeOut: boolean;
  /**
   * The address of the fee recipient. If provided, a 25 bips (0.25%) fee will be
   * taken and sent to this address. When not provided, no fee is taken.
   */
  feeRecipient?: `0x${string}`;
}
