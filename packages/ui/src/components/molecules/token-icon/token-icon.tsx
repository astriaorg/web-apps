import { type ComponentType } from "react";

import type { IconProps } from "@repo/flame-types";

import {
  CelestiaIcon,
  DotIcon,
  DropTiaIcon,
  MilkTiaIcon,
  StrideIcon,
  StrideTiaIcon,
  UsdcIcon,
  WrappedTiaIcon,
} from "../../../icons";
import { DEFAULT_ICON_SIZE } from "../../../icons/constants";

// FIXME - this is redundant and can be derived from the chain configs
const TOKEN_SYMBOLS = {
  TIA: "TIA",
  DTIA: "DTIA",
  WTIA: "WTIA",
  STTIA: "STTIA",
  USDC: "USDC",
  MILKTIA: "MILKTIA",
  STRIDE: "STRIDE",
} as const;
type TokenSymbol = keyof typeof TOKEN_SYMBOLS;

const TOKEN_SYMBOL_TO_ICON_MAP: {
  [key in TokenSymbol]: ComponentType<IconProps>;
} = {
  [TOKEN_SYMBOLS.TIA]: CelestiaIcon,
  [TOKEN_SYMBOLS.DTIA]: DropTiaIcon,
  [TOKEN_SYMBOLS.WTIA]: WrappedTiaIcon,
  [TOKEN_SYMBOLS.STTIA]: StrideTiaIcon,
  [TOKEN_SYMBOLS.USDC]: UsdcIcon,
  [TOKEN_SYMBOLS.MILKTIA]: MilkTiaIcon,
  [TOKEN_SYMBOLS.STRIDE]: StrideIcon,
};

export const TokenIcon = ({
  symbol,
  size = DEFAULT_ICON_SIZE,
  className = "",
}: {
  symbol?: string;
  size?: number;
  className?: string;
}) => {
  const normalizedSymbol = symbol?.toUpperCase();

  const IconComponent = (() => {
    if (normalizedSymbol && normalizedSymbol in TOKEN_SYMBOLS) {
      return TOKEN_SYMBOL_TO_ICON_MAP[normalizedSymbol as TokenSymbol];
    }
    return DotIcon;
  })();

  return <IconComponent size={size} className={className} />;
};

const MULTI_TOKEN_ICON_SHIFT = 6;

export const MultiTokenIcon = ({
  symbols,
  size = DEFAULT_ICON_SIZE,
}: {
  symbols: string[];
  size?: number;
}) => {
  return (
    <div className="flex items-center h-full">
      {symbols.map((symbol, index) => (
        <div
          key={symbol}
          className="h-full"
          style={{
            height: size,
            width: size,
            marginLeft: `-${MULTI_TOKEN_ICON_SHIFT * index}px`,
          }}
        >
          <TokenIcon symbol={symbol} size={size} />
        </div>
      ))}
    </div>
  );
};
