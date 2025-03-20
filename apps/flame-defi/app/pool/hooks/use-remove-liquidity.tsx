import { TokenPriceData } from "pool/types";
import { useState, useEffect } from "react";
import { usePoolDetailsContext } from ".";

export const useRemoveLiquidity = () => {
  const { tokenData, collectAsWTIA } = usePoolDetailsContext();

  const [valuesToRemove, setValuesToRemove] = useState<TokenPriceData[]>(() =>
    tokenData.map((token) => ({
      ...token,
      liquidity: token.liquidity * 0.25, // Set initial liquidity to 25% to match the slider initial value
    }))
  );

  useEffect(() => {
    setValuesToRemove((prevValues) =>
      prevValues.map((token) => {
        if (collectAsWTIA && token.symbol === "TIA") {
          return { ...token, symbol: "WTIA" };
        }
        if (!collectAsWTIA && token.symbol === "WTIA") {
          return { ...token, symbol: "TIA" };
        }
        return token;
      })
    );
  }, [collectAsWTIA]);

  const handlePercentToRemove = (percent: number) => {
    if (tokenData[0] && tokenData[1]) {
      setValuesToRemove(
        tokenData.map((token) => ({
          ...token,
          liquidity: (token.liquidity * percent) / 100,
        }))
      );
    }
  };

  return { valuesToRemove, handlePercentToRemove };
};
