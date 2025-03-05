import { DEFAULT_ICON_SIZE } from "../../../icons/constants";
import {
  MilkTiaIcon,
  StrideIcon,
  CelestiaIcon,
  StrideTiaIcon,
  UsdcIcon,
  WrappedTiaIcon,
  DotIcon,
} from "../../../icons";

export const TokenIcon = ({
  symbol,
  size = DEFAULT_ICON_SIZE,
  className = "",
}: {
  symbol: string | null;
  size?: number;
  className?: string;
}) => {
  const tokenKey = symbol?.toLowerCase() || "unknown";

  const tokenIcons = {
    tia: {
      Icon: CelestiaIcon,
    },
    wtia: {
      Icon: WrappedTiaIcon,
    },
    sttia: {
      Icon: StrideTiaIcon,
    },
    usdc: {
      Icon: UsdcIcon,
    },
    milktia: {
      Icon: MilkTiaIcon,
    },
    stride: {
      Icon: StrideIcon,
    },
    unknown: {
      Icon: DotIcon,
    },
  };

  const IconComponent = Object.keys(tokenIcons).includes(tokenKey)
    ? tokenIcons[tokenKey as keyof typeof tokenIcons].Icon
    : tokenIcons["unknown"].Icon;

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
