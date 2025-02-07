import JSBI from "jsbi";

export interface ExactInputSingleParams {
  tokenIn: `0x${string}`;
  tokenOut: `0x${string}`;
  fee: number;
  recipient: `0x${string}`;
  amountIn: bigint;
  amountOutMinimum: bigint;
  sqrtPriceLimitX96: bigint;
}

export interface ExactInputParams {
  path: `0x${string}`;
  recipient: `0x${string}`;
  amountIn: bigint;
  amountOutMinimum: bigint;
}

export interface ExactOutputSingleParams {
  tokenIn: `0x${string}`;
  tokenOut: `0x${string}`;
  fee: number;
  recipient: `0x${string}`;
  amountOut: bigint;
  amountInMaximum: bigint;
  sqrtPriceLimitX96: bigint;
}

export interface ExactOutputParams {
  path: `0x${string}`;
  recipient: `0x${string}`;
  amountOut: bigint;
  amountInMaximum: bigint;
}

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
    symbol: string,
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
      JSBI.BigInt(token.decimals),
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
    type: TradeType,
  ) {
    this.route = route;
    this.type = type;
    this.inputAmount = inputAmount;
    this.outputAmount = outputAmount;
  }
}

export interface SwapOptions {
  recipient: `0x${string}`;
  slippageTolerance: number; // in basis points (e.g. 50 = 0.5%)
  deadline: bigint;
}
