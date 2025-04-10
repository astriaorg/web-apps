import { PoolToken } from "pool/types";
import { useState, useEffect } from "react";
import { usePoolPositionContext } from ".";
import { useAstriaChainData } from "config/hooks/use-config";
export const useRemoveLiquidity = () => {
  const { poolToken0, poolToken1, collectAsNative } = usePoolPositionContext();
  const { wrappedNativeToken, nativeToken } = useAstriaChainData();
  const poolTokens = poolToken0 && poolToken1 ? [poolToken0, poolToken1] : [];

  const [liquidityToRemove, setLiquidityToRemove] = useState<PoolToken[]>(() =>
    poolTokens.map((token) => ({
      ...token,
      liquidity: token.liquidity * 0.25, // Set initial liquidity to 25% to match the slider initial value
    })),
  );

  useEffect(() => {
    setLiquidityToRemove((prevValues) =>
      prevValues.map((poolToken) => {
        let updatedToken = poolToken.token;

        if (collectAsNative && updatedToken.isNative && wrappedNativeToken) {
          updatedToken = wrappedNativeToken;
        }
        if (!collectAsNative && updatedToken.isWrappedNative && nativeToken) {
          updatedToken = nativeToken;
        }

        return {
          ...poolToken,
          token: updatedToken,
        };
      }),
    );
  }, [collectAsNative, wrappedNativeToken, nativeToken]);

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
