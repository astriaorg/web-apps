import type { NextApiRequest, NextApiResponse } from "next";
import { ChainId, EvmCurrency } from "../../../app/config";
import { z } from "zod";

export enum RouterPreference {
  API = "api",
  CLIENT = "client",
  PRICE = "price",
}

export type V3PoolInRoute = {
  type: "v3-pool"
  tokenIn: EvmCurrency
  tokenOut: EvmCurrency
  sqrtRatioX96: string
  liquidity: string
  tickCurrent: string
  fee: string
  amountIn?: string
  amountOut?: string
  address?: string
}

type V2Reserve = {
  token: EvmCurrency
  quotient: string
}

export type V2PoolInRoute = {
  type: "v2-pool"
  tokenIn: EvmCurrency
  tokenOut: EvmCurrency
  reserve0: V2Reserve
  reserve1: V2Reserve
  amountIn?: string
  amountOut?: string
  address?: string
}

// Zod schema for request validation
const GetQuoteRequestSchema = z.object({
  tokenInAddress: z.string().min(1),
  tokenInChainId: z.nativeEnum(ChainId),
  tokenInDecimals: z.number().int().min(0),
  tokenInSymbol: z.string().optional(),
  tokenOutAddress: z.string().min(1),
  tokenOutChainId: z.nativeEnum(ChainId),
  tokenOutDecimals: z.number().int().min(0),
  tokenOutSymbol: z.string().optional(),
  amount: z.string().min(1),
  routerPreference: z.nativeEnum(RouterPreference),
  type: z.enum(["exactIn", "exactOut"]),
});

type GetQuoteRequest = z.infer<typeof GetQuoteRequestSchema>;

type GetQuoteResponse = {
  quoteId?: string
  blockNumber: string
  amount: string
  amountDecimals: string
  gasPriceWei: string
  gasUseEstimate: string
  gasUseEstimateQuote: string
  gasUseEstimateQuoteDecimals: string
  gasUseEstimateUSD: string
  methodParameters?: { calldata: string; value: string }
  quote: string
  quoteDecimals: string
  quoteGasAdjusted: string
  quoteGasAdjustedDecimals: string
  route: Array<(V3PoolInRoute | V2PoolInRoute)[]>
  routeString: string
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<GetQuoteResponse | { message: string; errors: z.ZodError["errors"] }>,
) {
  if (req.method !== "POST") {
    return res.status(405).json({
      message: "Method not allowed",
      errors: [{
        code: "custom",
        message: "Only POST method is allowed",
        path: ["method"],
      }],
    });
  }

  try {
    const validatedBody = GetQuoteRequestSchema.parse(req.body);

    return res.status(200).json({
      quoteId: "123",
      blockNumber: "123",
      amount: "123",
      amountDecimals: "123",
      gasPriceWei: "123",
      gasUseEstimate: "123",
      gasUseEstimateQuote: "123",
      gasUseEstimateQuoteDecimals: "123",
      gasUseEstimateUSD: "123",
      methodParameters: { calldata: "123", value: "123" },
      quote: "123",
      quoteDecimals: "123",
      quoteGasAdjusted: "123",
      quoteGasAdjustedDecimals: "123",
      route: [],
      routeString: "123",
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: "Invalid request body",
        errors: error.errors,
      });
    }

    return res.status(500).json({
      message: "Internal server error",
      errors: [{
        code: "custom",
        message: "An unexpected error occurred",
        path: [],
      }],
    });
  }
}
