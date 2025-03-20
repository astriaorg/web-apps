import { PoolTokenData } from "pool/types";
import { useState, useEffect } from "react";
import { usePoolDetailsContext } from ".";

export const useRemoveLiquidity = () => {
  const { poolTokenData, collectAsWTIA } = usePoolDetailsContext();

  const [liquidityToRemove, setLiquidityToRemove] = useState<PoolTokenData[]>(
    () =>
      poolTokenData.map((token) => ({
        ...token,
        liquidity: token.liquidity * 0.25, // Set initial liquidity to 25% to match the slider initial value
      })),
  );

  useEffect(() => {
    setLiquidityToRemove((prevValues) =>
      prevValues.map((token) => {
        if (collectAsWTIA && token.symbol === "TIA") {
          return { ...token, symbol: "WTIA" };
        }
        if (!collectAsWTIA && token.symbol === "WTIA") {
          return { ...token, symbol: "TIA" };
        }
        return token;
      }),
    );
  }, [collectAsWTIA]);

  const handlePercentToRemove = (percent: number) => {
    setLiquidityToRemove(
      poolTokenData.map((token) => ({
        ...token,
        liquidity: (token.liquidity * percent) / 100,
      })),
    );
  };

  return { liquidityToRemove, handlePercentToRemove };
};
