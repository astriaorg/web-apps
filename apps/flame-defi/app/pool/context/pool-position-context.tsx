"use client";

import { PoolPositionResponse, PoolToken } from "pool/types";
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
  createNonfungiblePositionManagerService,
  createPoolFactoryService,
  createPoolService,
} from "features/evm-wallet";
import { useAccount, useConfig } from "wagmi";
import { useEvmChainData } from "config/hooks/use-config";
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
  const positionNftId = params["position-nft-id"] as string;
  const { selectedChain, nativeToken, wrappedNativeToken } = useEvmChainData();
  const { currencies } = selectedChain;
  const currentPoolSettings = getFromLocalStorage("poolSettings") || {};
  const [collectAsWrappedNative, setCollectAsWrappedNative] = useState<boolean>(
    currentPoolSettings.collectAsWrappedNative || false,
  );
  const [currentPrice, setCurrentPrice] = useState<string>("");
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [invertedPrice, setInvertedPrice] = useState<boolean>(false);
  const [isReversedPoolTokens, setIsReversedPoolTokens] =
    useState<boolean>(false);
  const [poolTokens, setPoolTokens] = useState<PoolToken[] | []>([]);
  const [poolPosition, setPoolPosition] = useState<PoolPositionResponse | null>(
    null,
  );
  const [feeTier, setFeeTier] = useState<string>("");
  const [rawFeeTier, setRawFeeTier] = useState<number>(0);
  const [isPositionClosed, setIsPositionClosed] = useState<boolean>(false);
  const poolToken0 = poolTokens[0] || null;
  const poolToken1 = poolTokens[1] || null;

  const [selectedSymbol, setSelectedSymbol] = useState<string>("");

  const handleReverseTokenData = (symbol: string) => {
    setSelectedSymbol(symbol);
    setInvertedPrice(!invertedPrice);
    setIsReversedPoolTokens(!isReversedPoolTokens);
  };
  const NonfungiblePositionManagerService =
    createNonfungiblePositionManagerService(
      wagmiConfig,
      selectedChain.contracts.nonfungiblePositionManager.address,
    );

  const getPoolTokens = useCallback(async () => {
    try {
      const position = await NonfungiblePositionManagerService.positions(
        selectedChain.chainId,
        positionNftId,
      );
      const isisPositionClosed = position.liquidity === 0n;
      setIsPositionClosed(isisPositionClosed);
      setPoolPosition(position);

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

        setPoolTokens([poolToken0, poolToken1]);
        setSelectedSymbol(poolToken0.token.coinDenom);
      }
    } catch (error) {
      console.error("Error fetching pool tokens:", error);
    }
  }, [
    currencies,
    NonfungiblePositionManagerService,
    selectedChain.chainId,
    selectedChain.contracts.poolFactory.address,
    selectedChain.contracts.wrappedNativeToken.address,
    positionNftId,
    wagmiConfig,
  ]);

  const getFeeTier = useCallback(async () => {
    const position = await NonfungiblePositionManagerService.positions(
      selectedChain.chainId,
      positionNftId,
    );
    const feeTier = formatNumber(position.fee / 1_000_000, {
      style: "percent",
      maximumFractionDigits: 2,
    });
    setFeeTier(feeTier);
    setRawFeeTier(position.fee);
  }, [
    formatNumber,
    NonfungiblePositionManagerService,
    selectedChain.chainId,
    positionNftId,
  ]);

  const getPriceRange = useCallback(async () => {
    if (!address) {
      return;
    }

    try {
      const position = await NonfungiblePositionManagerService.positions(
        selectedChain.chainId,
        positionNftId,
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
    NonfungiblePositionManagerService,
    selectedChain,
    positionNftId,
    currencies,
    wagmiConfig,
    invertedPrice,
  ]);

  useEffect(() => {
    if (poolTokens.length === 0) {
      void getPoolTokens();
      void getFeeTier();
    }
  }, [poolTokens.length, getPoolTokens, getFeeTier]);

  const refreshPoolPosition = useCallback(() => {
    void getPoolTokens();
    void getFeeTier();
  }, [getPoolTokens, getFeeTier]);

  useEffect(() => {
    void getPriceRange();
  }, [invertedPrice, getPriceRange]);

  const handleCollectAsWrappedNative = (collectAsWrappedNative: boolean) => {
    setCollectAsWrappedNative(collectAsWrappedNative);
    setInLocalStorage("poolSettings", {
      collectAsWrappedNative: collectAsWrappedNative,
    });

    if (collectAsWrappedNative) {
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
    setSelectedSymbol(poolTokens[0]?.token.coinDenom ?? "");
  };

  return (
    <PoolPositionContext.Provider
      value={{
        feeTier,
        rawFeeTier,
        selectedSymbol,
        handleReverseTokenData,
        collectAsWrappedNative,
        handleCollectAsWrappedNative,
        poolToken0,
        poolToken1,
        currentPrice,
        minPrice,
        maxPrice,
        poolPosition,
        isReversedPoolTokens,
        isPositionClosed,
        refreshPoolPosition,
        positionNftId,
      }}
    >
      {children}
    </PoolPositionContext.Provider>
  );
};
