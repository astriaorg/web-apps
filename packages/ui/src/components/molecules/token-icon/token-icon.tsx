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

const TOKEN_SYMBOL_TO_ICON_MAP: {
  [key: string]: ComponentType<IconProps>;
} = {
  tia: CelestiaIcon,
  dtia: DropTiaIcon,
  wtia: WrappedTiaIcon,
  sttia: StrideTiaIcon,
  usdc: UsdcIcon,
  milktia: MilkTiaIcon,
  stride: StrideIcon,
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
    if (normalizedSymbol && TOKEN_SYMBOL_TO_ICON_MAP[normalizedSymbol]) {
      return TOKEN_SYMBOL_TO_ICON_MAP[normalizedSymbol];
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
