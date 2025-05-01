import { useAstriaChainData } from "config";
import { useCallback, useEffect, useMemo, useState } from "react";

import { PoolToken } from "pool/types";

import { usePoolPositionContext } from ".";

export const useRemoveLiquidityPercentage = () => {
  const { poolToken0, poolToken1, isCollectAsWrappedNative } =
    usePoolPositionContext();
  const { wrappedNativeToken, nativeToken } = useAstriaChainData();
  const poolTokens = useMemo(
    () => (poolToken0 && poolToken1 ? [poolToken0, poolToken1] : []),
    [poolToken0, poolToken1],
  );

  const [liquidityToRemove, setLiquidityToRemove] = useState<PoolToken[]>([]);
  const [percentageToRemove, setPercentageToRemove] = useState<number>(25);

  const defaultLiquidityToRemove = useMemo(
    () =>
      poolTokens.map((token) => ({
        ...token,
        liquidity: (token.liquidity * percentageToRemove) / 100,
      })),
    [poolTokens, percentageToRemove],
  );

  useEffect(() => {
    if (poolTokens.length > 0) {
      setLiquidityToRemove(defaultLiquidityToRemove);
    }
  }, [defaultLiquidityToRemove, poolTokens]);

  useEffect(() => {
    setLiquidityToRemove((prevValues) =>
      prevValues.map((poolToken) => {
        let updatedToken = poolToken.token;

        if (
          isCollectAsWrappedNative &&
          updatedToken.isNative &&
          wrappedNativeToken
        ) {
          updatedToken = wrappedNativeToken;
        }
        if (
          !isCollectAsWrappedNative &&
          updatedToken.isWrappedNative &&
          nativeToken
        ) {
          updatedToken = nativeToken;
        }

        return {
          ...poolToken,
          token: updatedToken,
        };
      }),
    );
  }, [isCollectAsWrappedNative, wrappedNativeToken, nativeToken]);

  const handlePercentToRemove = (percent: number) => {
    setPercentageToRemove(percent);
    const percentToRemove = poolTokens.map((token) => ({
      ...token,
      liquidity: (token.liquidity * percent) / 100,
    }));
    setLiquidityToRemove(percentToRemove);
  };

  const refreshLiquidityToRemove = useCallback(() => {
    const refreshedValues = poolTokens.map((token) => ({
      ...token,
      liquidity: (token.liquidity * percentageToRemove) / 100,
    }));
    setLiquidityToRemove(refreshedValues);
  }, [poolTokens, percentageToRemove]);

  return {
    liquidityToRemove,
    handlePercentToRemove,
    percentageToRemove,
    refreshLiquidityToRemove,
  };
};
