export enum TOKEN_INPUTS {
  TOKEN_ONE = "token_one",
  TOKEN_TWO = "token_two",
}

export const RPC_URL = "https://rpc.flame.astria.org";
export const SWAP_ROUTER_ADDRESS = "0x29bBaFf21695fA41e446c4f37c07C699d9f08021";
export const RECIPIENT_ADDRESS = "0xb0E31D878F49Ec0403A25944d6B1aE1bf05D17E1";
export const AMOUNT = "100000";
export const TRADE_TYPE = "exactIn";

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
