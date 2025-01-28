import {
  CelestiaIcon,
  MilkTiaIcon,
  StrideTiaIcon,
  UsdcIcon,
  WrappedTiaIcon,
} from "@repo/ui/icons";
import { TokenItem } from "@repo/ui/types";

export enum TOKEN_INPUTS {
  TOKEN_ONE = "token_one",
  TOKEN_TWO = "token_two",
}

// NOTE: temporary tokens until we have a real token list from a api
export const tokens: TokenItem[] = [
  {
    Icon: CelestiaIcon,
    title: "TIA",
    symbol: "TIA",
  },
  {
    Icon: WrappedTiaIcon,
    title: "Wrapped Celestia",
    symbol: "WTIA",
  },
  {
    Icon: MilkTiaIcon,
    title: "Milk TIA",
    symbol: "milkTIA",
  },
  {
    Icon: StrideTiaIcon,
    title: "Stride TIA",
    symbol: "stTIA",
  },
  {
    Icon: UsdcIcon,
    title: "USDC",
    symbol: "USDC",
  },
];

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
