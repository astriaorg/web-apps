"use client";

import { PoolToken } from "pool/types";
import { useParams } from "next/navigation";
import { PoolPositionContextProps } from "pool/types";
import {
  createContext,
  PropsWithChildren,
  useCallback,
  useEffect,
  useState,
} from "react";
import { useIntl } from "react-intl";
import { getFromLocalStorage, setInLocalStorage } from "@repo/ui/utils";
import {
  createNonFungiblePositionService,
  createPoolFactoryService,
  createPoolService,
} from "features/evm-wallet";
import { useAccount, useConfig } from "wagmi";
import { useAstriaChainData } from "config/hooks/use-config";
import {
  getTokensLiquidityAmounts,
  getMinMaxTick,
  getTokenDataFromCurrencies,
  sqrtPriceX96ToPrice,
  tickToPrice,
} from "./pool-position-helpers";

export const PoolPositionContext = createContext<
  PoolPositionContextProps | undefined
>(undefined);

export const PoolPositionContextProvider = ({
  children,
}: PropsWithChildren) => {
  const params = useParams();
  const wagmiConfig = useConfig();
  const { address } = useAccount();
  const { formatNumber } = useIntl();
  const tokenId = params["token-id"] as string;
  const { selectedChain, nativeToken, wrappedNativeToken } = useAstriaChainData();
  const { currencies } = selectedChain;
  const currentPoolSettings = getFromLocalStorage("poolSettings") || {};
  const [collectAsNative, setCollectAsNative] = useState<boolean>(
    currentPoolSettings.collectAsNative || false,
  );
  const [currentPrice, setCurrentPrice] = useState<string>("");
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [invertedPrice, setInvertedPrice] = useState<boolean>(false);
  const [symbols, setSymbols] = useState<string[]>([]);
  const [poolTokens, setPoolTokens] = useState<PoolToken[] | []>([]);
  const [feeTier, setFeeTier] = useState<string>("");

  const poolTokenOne = poolTokens[0] || null;
  const poolTokenTwo = poolTokens[1] || null;

  const [selectedSymbol, setSelectedSymbol] = useState<string>("");

  const handleReverseTokenData = (symbol: string) => {
    const reversedTokenData = [...poolTokens].reverse();
    setPoolTokens(reversedTokenData);
    setSelectedSymbol(symbol);
    setInvertedPrice(!invertedPrice);
  };
  const nonFungiblePositionService = createNonFungiblePositionService(
    wagmiConfig,
    selectedChain.contracts.nonfungiblePositionManager.address,
  );

  const getPoolTokens = async () => {
    try {
      const position = await nonFungiblePositionService.positions(
        selectedChain.chainId,
        tokenId,
      );
      const token0 = getTokenDataFromCurrencies(
        currencies,
        position.tokenAddress0,
        selectedChain.contracts.wrappedNativeToken.address,
      );
      const token1 = getTokenDataFromCurrencies(
        currencies,
        position.tokenAddress1,
        selectedChain.contracts.wrappedNativeToken.address,
      );

      if (token0 && token1) {
        const unclaimedFees0 =
          Number(position.tokensOwed0) / 10 ** token0.coinDecimals;
        const unclaimedFees1 =
          Number(position.tokensOwed1) / 10 ** token1.coinDecimals;
        const factoryService = createPoolFactoryService(
          wagmiConfig,
          selectedChain.contracts.poolFactory.address,
        );
        const poolAddress = await factoryService.getPool(
          selectedChain.chainId,
          position.tokenAddress0,
          position.tokenAddress1,
          position.fee,
        );
        const poolService = createPoolService(wagmiConfig, poolAddress);
        const slot0 = await poolService.getSlot0(selectedChain.chainId);

        const { amount0, amount1 } = getTokensLiquidityAmounts(
          position,
          slot0.sqrtPriceX96,
          token0.coinDecimals,
          token1.coinDecimals,
        );

        const poolToken0: PoolToken = {
          unclaimedFees: unclaimedFees0,
          liquidity: amount0,
          liquidityPercentage: 50, // TODO: figure out how to calculate this.
          token: token0,
        };

        const poolToken1: PoolToken = {
          unclaimedFees: unclaimedFees1,
          liquidity: amount1,
          liquidityPercentage: 50, // TODO: figure out how to calculate this.
          token: token1,
        };

        setSymbols([poolToken0.token.coinDenom, poolToken1.token.coinDenom]);
        setPoolTokens([poolToken0, poolToken1]);
        setSelectedSymbol(poolToken0.token.coinDenom);
      }
    } catch (error) {
      console.error("Error fetching pool tokens:", error);
    }
  };

  const getFeeTier = async () => {
    const position = await nonFungiblePositionService.positions(
      selectedChain.chainId,
      tokenId,
    );
    const feeTier = formatNumber(position.fee / 1_000_000, {
      style: "percent",
      maximumFractionDigits: 2,
    });
    setFeeTier(feeTier);
  };

  const getPriceRange = useCallback(async () => {
    if (!address) {
      return;
    }

    try {
      const position = await nonFungiblePositionService.positions(
        selectedChain.chainId,
        tokenId,
      );
      const factoryService = createPoolFactoryService(
        wagmiConfig,
        selectedChain.contracts.poolFactory.address,
      );

      const token0 = getTokenDataFromCurrencies(
        currencies,
        position.tokenAddress0,
        selectedChain.contracts.wrappedNativeToken.address,
      );

      const token1 = getTokenDataFromCurrencies(
        currencies,
        position.tokenAddress1,
        selectedChain.contracts.wrappedNativeToken.address,
      );

      const poolAddress = await factoryService.getPool(
        selectedChain.chainId,
        position.tokenAddress0,
        position.tokenAddress1,
        position.fee,
      );
      const poolService = createPoolService(wagmiConfig, poolAddress);
      const slot0 = await poolService.getSlot0(selectedChain.chainId);
      const pricePerToken = sqrtPriceX96ToPrice(
        slot0.sqrtPriceX96,
        invertedPrice,
        token0?.coinDecimals,
        token1?.coinDecimals,
      );
      setCurrentPrice(pricePerToken.toFixed(6));

      if (position) {
        // Get the correct min/max tick values based on fee tier
        const { MIN_TICK, MAX_TICK } = getMinMaxTick(position.fee);

        // Check if position spans the full range
        const isFullRange =
          position.tickLower === MIN_TICK && position.tickUpper === MAX_TICK;

        if (isFullRange) {
          setMinPrice("0");
          setMaxPrice("∞");
        } else {
          const minPriceFromTick = tickToPrice(
            position.tickLower,
            token0?.coinDecimals,
            token1?.coinDecimals,
          );
          const maxPriceFromTick = tickToPrice(
            position.tickUpper,
            token0?.coinDecimals,
            token1?.coinDecimals,
          );
          setMinPrice(minPriceFromTick.toFixed(6));
          setMaxPrice(maxPriceFromTick.toFixed(6));
        }
      }
    } catch (error) {
      console.error("Error fetching price range:", error);
    }
  }, [
    address,
    nonFungiblePositionService,
    selectedChain,
    tokenId,
    currencies,
    wagmiConfig,
    invertedPrice,
  ]);

  if (poolTokens.length === 0) {
    getPoolTokens();
    getFeeTier();
  }

  useEffect(() => {
    getPriceRange();
  }, [invertedPrice, getPriceRange]);

  const handleCollectAsNative = (collectAsNative: boolean) => {
    setCollectAsNative(collectAsNative);
    setInLocalStorage("poolSettings", {
      collectAsNative: collectAsNative,
    });

    if (collectAsNative) {
      poolTokens.map((poolToken) => {
        if (poolToken.token.isNative && wrappedNativeToken) {
          poolToken.token = wrappedNativeToken;
        }
      });
    } else {
      poolTokens.map((poolToken) => {
        if (poolToken.token.isWrappedNative && nativeToken) {
          poolToken.token = nativeToken;
        }
      });
    }
    setPoolTokens(poolTokens);
    setSymbols([
      poolTokens[1]?.token.coinDenom ?? "",
      poolTokens[0]?.token.coinDenom ?? "",
    ]);
    setSelectedSymbol(poolTokens[0]?.token.coinDenom ?? "");
  };

  return (
    <PoolPositionContext.Provider
      value={{
        feeTier,
        symbols,
        selectedSymbol,
        handleReverseTokenData,
        collectAsNative,
        handleCollectAsNative,
        poolTokenOne,
        poolTokenTwo,
        currentPrice,
        minPrice,
        maxPrice,
      }}
    >
      {children}
    </PoolPositionContext.Provider>
  );
};
