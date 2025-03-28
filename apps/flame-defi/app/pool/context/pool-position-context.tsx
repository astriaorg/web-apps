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
import { EvmCurrency, TXN_STATUS } from "@repo/flame-types";
import {
  createNonFungiblePositionService,
  createPoolFactoryService,
  createPoolService,
} from "features/evm-wallet";
import { useAccount, useConfig } from "wagmi";
import { useEvmChainData } from "config/hooks/use-config";

export const PoolPositionContext = createContext<
  PoolPositionContextProps | undefined
>(undefined);

function sqrtPriceX96ToPrice(
  sqrtPriceX96: bigint,
  invert: boolean = false,
  token0Decimals?: number,
  token1Decimals?: number,
): number {
  // Convert sqrtPriceX96 to decimal
  const sqrtPriceDecimal = Number(sqrtPriceX96) / 2 ** 96;

  // Square it to get the raw price
  const rawPrice = sqrtPriceDecimal * sqrtPriceDecimal;

  // Adjust for token decimal differences if decimals are provided
  let adjustedPrice = rawPrice;
  if (token0Decimals !== undefined && token1Decimals !== undefined) {
    // Formula: price * 10^(token0.decimals - token1.decimals)
    adjustedPrice = rawPrice * Math.pow(10, token0Decimals - token1Decimals);
  }

  // Return either direct price (token1/token0) or inverted price (token0/token1)
  return invert ? 1 / adjustedPrice : adjustedPrice;
}

function tickToPrice(
  tick: number,
  token0Decimals?: number,
  token1Decimals?: number,
): number {
  // Calculate the raw price from tick
  const rawPrice = 1.0001 ** tick;

  // Adjust for token decimal differences if provided
  if (token0Decimals !== undefined && token1Decimals !== undefined) {
    // Formula: price * 10^(token0.decimals - token1.decimals)
    return rawPrice * Math.pow(10, token0Decimals - token1Decimals);
  }

  return rawPrice;
}

const getTokenDataFromCurrencies = (
  currencies: EvmCurrency[],
  tokenAddress: string,
): EvmCurrency | null => {
  // TODO: replace this with a more elegant solution to return TIA when the tokenAddress returned from the contract is WTIA
  if (tokenAddress === "0x61B7794B6A0Cc383B367c327B91E5Ba85915a071") {
    return (
      currencies.find(
        (currency) => currency.nativeTokenWithdrawerContractAddress,
      ) || null
    );
  }

  return (
    currencies.find(
      (currency) => currency.erc20ContractAddress === tokenAddress,
    ) || null
  );
};

function getMinMaxTick(fee: number): { MIN_TICK: number; MAX_TICK: number } {
  const MAX_TICK_SPACING_BOUNDARY = 887272; // Maximum tick value supported by Uniswap V3
  const MIN_TICK_SPACING_BOUNDARY = -887272; // Minimum tick value supported by Uniswap V3
  // Tick spacing based on fee
  const tickSpacing =
    fee === 500 ? 10 : fee === 3000 ? 60 : fee === 10000 ? 200 : 1;

  // Min and max ticks are derived from tick spacing
  // This matches Uniswap V3's approach for determining full range positions
  const MIN_TICK =
    Math.ceil(MIN_TICK_SPACING_BOUNDARY / tickSpacing) * tickSpacing;
  const MAX_TICK =
    Math.floor(MAX_TICK_SPACING_BOUNDARY / tickSpacing) * tickSpacing;

  return { MIN_TICK, MAX_TICK };
}

/**
 * Calculates token amounts from a Uniswap V3 position's liquidity
 *
 * @param position - The position data from the NFT position manager
 * @param sqrtPriceX96 - The current sqrt price from the pool's slot0
 * @param token0Decimals - Number of decimals for token0
 * @param token1Decimals - Number of decimals for token1
 * @returns An object containing the calculated amounts for both tokens
 */
function calculateTokenAmountsFromLiquidity(
  position: { liquidity: bigint; tickLower: number; tickUpper: number },
  sqrtPriceX96: bigint,
  token0Decimals: number,
  token1Decimals: number,
): { amount0: number; amount1: number } {
  const TICK_BASE = 1.0001; // NOTE: each tick represents a 0.01% (or 1.0001x) price change. This is a fundamental constant in the Uniswap V3 design.
  // Convert sqrtPrice to decimal form
  const sqrtPriceCurrent = Number(sqrtPriceX96) / 2 ** 96;

  // Calculate sqrt prices at the lower and upper ticks
  const sqrtPriceLower = TICK_BASE ** (position.tickLower / 2);
  const sqrtPriceUpper = TICK_BASE ** (position.tickUpper / 2);

  let amount0 = 0;
  let amount1 = 0;

  // Position is below current price: only token1
  if (sqrtPriceLower >= sqrtPriceCurrent) {
    amount1 = Number(position.liquidity) * (sqrtPriceUpper - sqrtPriceLower);
  }
  // Position is above current price: only token0
  else if (sqrtPriceUpper <= sqrtPriceCurrent) {
    amount0 =
      Number(position.liquidity) * (1 / sqrtPriceLower - 1 / sqrtPriceUpper);
  }
  // Position straddles current price: both tokens
  else {
    amount0 =
      Number(position.liquidity) * (1 / sqrtPriceCurrent - 1 / sqrtPriceUpper);
    amount1 = Number(position.liquidity) * (sqrtPriceCurrent - sqrtPriceLower);
  }

  // Adjust for token decimals
  const adjustedAmount0 = amount0 / 10 ** token0Decimals;
  const adjustedAmount1 = amount1 / 10 ** token1Decimals;

  return { amount0: adjustedAmount0, amount1: adjustedAmount1 };
}

export const PoolPositionContextProvider = ({
  children,
}: PropsWithChildren) => {
  const params = useParams();
  const wagmiConfig = useConfig();
  const { address } = useAccount();
  const tokenId = params["token-id"] as string;
  const { selectedChain } = useEvmChainData();
  const { currencies } = selectedChain;
  const currentPoolSettings = getFromLocalStorage("poolSettings") || {};

  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [txnStatus, setTxnStatus] = useState<TXN_STATUS>(TXN_STATUS.IDLE);
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
      const tokenOne = getTokenDataFromCurrencies(
        currencies,
        position.tokenAddress0,
      );
      const tokenTwo = getTokenDataFromCurrencies(
        currencies,
        position.tokenAddress1,
      );

      if (tokenOne && tokenTwo) {
        const unclaimedFees0 =
          Number(position.tokensOwed0) / 10 ** tokenOne.coinDecimals;
        const unclaimedFees1 =
          Number(position.tokensOwed1) / 10 ** tokenTwo.coinDecimals;
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

        // Calculate token amounts from the position's liquidity
        const { amount0, amount1 } = calculateTokenAmountsFromLiquidity(
          position,
          slot0.sqrtPriceX96,
          tokenOne.coinDecimals,
          tokenTwo.coinDecimals,
        );

        const poolToken0: PoolToken = {
          symbol: tokenOne.coinDenom,
          unclaimedFees: unclaimedFees0,
          liquidity: amount0,
          liquidityPercentage: 0.05, // TODO: calculate this
        };

        const poolToken1: PoolToken = {
          symbol: tokenTwo.coinDenom,
          unclaimedFees: unclaimedFees1,
          liquidity: amount1,
          liquidityPercentage: 0.05, // TODO: calculate this
        };

        setSymbols([poolToken0.symbol, poolToken1.symbol]);
        setPoolTokens([poolToken0, poolToken1]);
        setSelectedSymbol(poolToken0.symbol);
      }
    } catch (error) {
      console.error("Error fetching pool tokens:", error);
    }
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
      );

      const token1 = getTokenDataFromCurrencies(
        currencies,
        position.tokenAddress1,
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

  useEffect(() => {
    getPoolTokens();
    getFeeTier();
  }, []);

  useEffect(() => {
    getPriceRange();
  }, [invertedPrice, getPriceRange]);


  const { formatNumber } = useIntl();

  const [collectAsNative, setCollectAsNative] = useState<boolean>(
    currentPoolSettings.collectAsNative || false,
  );

  const handleCollectAsNative = (collectAsNative: boolean) => {
    setCollectAsNative(collectAsNative);
    setInLocalStorage("poolSettings", {
      collectAsNative: collectAsNative,
    });
    if (collectAsNative) {
      poolTokens?.map((token) => {
        if (token.symbol === "TIA") {
          token.symbol = "WTIA";
        }
      });
    } else {
      poolTokens?.map((token) => {
        if (token.symbol === "WTIA") {
          token.symbol = "TIA";
        }
      });
    }
    setPoolTokens(poolTokens);
    setSymbols([poolTokens[1]?.symbol || "", poolTokens[0]?.symbol || ""]);
    setSelectedSymbol(poolTokens[0]?.symbol || "");
  };

  return (
    <PoolPositionContext.Provider
      value={{
        poolTokens,
        feeTier,
        symbols,
        selectedSymbol,
        handleReverseTokenData,
        collectAsNative,
        handleCollectAsNative,
        txnStatus,
        setTxnStatus,
        modalOpen,
        setModalOpen,
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
