import { PoolToken } from "pool/types";
import { useState, useEffect } from "react";
import { usePoolDetailsContext } from ".";

export const useRemoveLiquidity = () => {
  const { poolTokens, collectAsNative } = usePoolDetailsContext();

  const [liquidityToRemove, setLiquidityToRemove] = useState<PoolToken[]>(
    () =>
      poolTokens.map((token) => ({
        ...token,
        liquidity: token.liquidity * 0.25, // Set initial liquidity to 25% to match the slider initial value
      })),
  );

  useEffect(() => {
    setLiquidityToRemove((prevValues) =>
      prevValues.map((token) => {
        if (collectAsNative && token.symbol === "TIA") {
          return { ...token, symbol: "WTIA" };
        }
        if (!collectAsNative && token.symbol === "WTIA") {
          return { ...token, symbol: "TIA" };
        }
        return token;
      }),
    );
  }, [collectAsNative]);

  const handlePercentToRemove = (percent: number) => {
    setLiquidityToRemove(
      poolTokens.map((token) => ({
        ...token,
        liquidity: (token.liquidity * percent) / 100,
      })),
    );
  };

  return { liquidityToRemove, handlePercentToRemove };
};
