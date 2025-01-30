export enum TOKEN_INPUTS {
  TOKEN_ONE = "token_one",
  TOKEN_TWO = "token_two",
}

export enum SupportedChainId {
  MAINNET = 253368190,
  FLAME_TESTNET = 16604737732183,
  FLAME_DEVNET = 912559,
}

// NOTE: temporary tokens until we have a real token list from a ap

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
