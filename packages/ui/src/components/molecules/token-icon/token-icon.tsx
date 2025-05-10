import { type ComponentType } from "react";

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
export enum TokenSymbol {
  TIA = "tia",
  DTIA = "dtia",
  WTIA = "wtia",
  STTIA = "sttia",
  USDC = "usdc",
  MILKTIA = "milktia",
  STRIDE = "stride",
}

const TOKEN_SYMBOL_TO_ICON_MAP: {
  [key in TokenSymbol]: {
    Icon: ComponentType<{
      size?: number;
      className?: string;
    }>;
  };
} = {
  [TokenSymbol.TIA]: {
    Icon: CelestiaIcon,
  },
  [TokenSymbol.DTIA]: {
    Icon: DropTiaIcon,
  },
  [TokenSymbol.WTIA]: {
    Icon: WrappedTiaIcon,
  },
  [TokenSymbol.STTIA]: {
    Icon: StrideTiaIcon,
  },
  [TokenSymbol.USDC]: {
    Icon: UsdcIcon,
  },
  [TokenSymbol.MILKTIA]: {
    Icon: MilkTiaIcon,
  },
  [TokenSymbol.STRIDE]: {
    Icon: StrideIcon,
  },
};

export const TokenIcon = ({
  symbol,
  size = DEFAULT_ICON_SIZE,
  className = "",
}: {
  symbol: string;
  size?: number;
  className?: string;
}) => {
  const normalizedSymbol = symbol.toLowerCase() as TokenSymbol;
  const FallbackIcon = DotIcon;

  // Check if the symbol exists in our map.
  const isKnownToken = Object.values(TokenSymbol).includes(normalizedSymbol);

  const IconComponent = isKnownToken
    ? TOKEN_SYMBOL_TO_ICON_MAP[normalizedSymbol].Icon
    : FallbackIcon;

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
    <div
      className="flex items-center h-full"
      style={{
        marginRight: `${-MULTI_TOKEN_ICON_SHIFT * (symbols.length - 1)}px`,
      }}
    >
      {symbols.map((symbol, index) => (
        <div
          key={symbol}
          className="relative h-full"
          style={{
            height: size,
            width: size,
            right: `${MULTI_TOKEN_ICON_SHIFT * index}px`,
            zIndex: symbols.length,
          }}
        >
          <TokenIcon symbol={symbol} size={size} />
        </div>
      ))}
    </div>
  );
};
