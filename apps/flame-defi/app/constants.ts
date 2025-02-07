export enum TOKEN_INPUTS {
  TOKEN_ONE = "token_one",
  TOKEN_TWO = "token_two",
}

export enum TRADE_TYPE {
  EXACT_IN = "exactIn",
  EXACT_OUT = "exactOut",
}

export enum TXN_STATUS {
  IDLE = "idle",
  PENDING = "pending",
  SUCCESS = "success",
  FAILED = "failed",
}

export const defaultSlippageTolerance = 0.1;

export const feeData = [
  {
    id: 0,
    feePercent: "0.3%",
    text: "Best for most pairs.",
    tvl: "100M",
    selectPercent: "0.3%",
  },
  {
    id: 1,
    feePercent: "0.5%",
    text: "Best for stable pairs.",
    tvl: "100M",
    selectPercent: "0.5%",
  },
  {
    id: 2,
    feePercent: "1%",
    text: "Best for high-volatility pairs.",
    tvl: "100M",
    selectPercent: "1%",
  },
  {
    id: 3,
    feePercent: "1%",
    text: "Best for high-volatility pairs.",
    tvl: "100M",
    selectPercent: "1%",
  },
];
