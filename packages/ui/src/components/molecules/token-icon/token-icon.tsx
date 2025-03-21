import { DEFAULT_ICON_SIZE } from "../../../icons/constants";
import {
  MilkTiaIcon,
  StrideIcon,
  CelestiaIcon,
  StrideTiaIcon,
  UsdcIcon,
  WrappedTiaIcon,
  DotIcon,
  DropTiaIcon,
} from "../../../icons";
import { type ComponentType } from "react";

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

type IconComponentProps = {
  size?: number;
  className?: string;
};

type TokenIconMap = {
  [key in TokenSymbol]: {
    Icon: ComponentType<IconComponentProps>;
  };
};

const tokenIcons: TokenIconMap = {
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
  const normalizedSymbol = symbol.toLowerCase();
  const FallbackIcon = DotIcon;

  // Check if the symbol exists in our map
  const isKnownToken = Object.values(TokenSymbol).includes(
    normalizedSymbol as TokenSymbol,
  );

  const IconComponent = isKnownToken
    ? tokenIcons[normalizedSymbol as TokenSymbol].Icon
    : FallbackIcon;

  return <IconComponent size={size} className={className} />;
};

export const MultiTokenIcon = ({
  symbols,
  size = DEFAULT_ICON_SIZE,
  shift = 8,
}: {
  symbols: string[];
  size?: number;
  shift?: number;
}) => {
  return (
    <div
      className="flex items-center h-full"
      style={{ marginRight: `${-shift * (symbols.length - 1)}px` }}
    >
      {symbols.map((symbol, index) => (
        <div
          key={symbol}
          className="relative h-full"
          style={{
            height: size,
            width: size,
            right: `${shift * index}px`,
            zIndex: symbols.length,
          }}
        >
          <TokenIcon symbol={symbol} size={size} />
        </div>
      ))}
    </div>
  );
};
