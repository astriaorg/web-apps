"use client";

import type { EvmCurrency } from "@repo/flame-types";
import {
  Card,
  CardContent,
  CardFigureInput,
  useAssetAmountInput,
} from "@repo/ui/components";
import { useEvmChainData } from "config";
import { TokenSelect } from "pool/components/token-select";
import { FEE_TIER, type FeeTier } from "pool/constants/pool-constants";
import { useGetPoolTokenBalances } from "pool/hooks";
import { useGetPool } from "pool/hooks/use-get-pool";
import { FeeTierSelect } from "pool/modules/create-position/components/fee-tier-select";
import { useCallback, useMemo, useState } from "react";
import { useConfig } from "wagmi";

export const ContentSection = () => {
  const config = useConfig();
  const { selectedChain } = useEvmChainData();

  const [selectedFeeTier, setSelectedFeeTier] = useState<FeeTier>(
    FEE_TIER.MEDIUM,
  );

  const [token0, setToken0] = useState<EvmCurrency>(
    selectedChain.currencies.find((it) => it.coinDenom === "TIA")!,
  );
  const [token1, setToken1] = useState<EvmCurrency>(
    selectedChain.currencies.find((it) => it.coinDenom === "dTIA")!,
  );

  const { token0Balance, token1Balance } = useGetPoolTokenBalances(
    token0.coinDenom ?? "",
    token1?.coinDenom ?? "",
  );

  const token0Options = useMemo(() => {
    return selectedChain.currencies.filter(
      (currency) =>
        currency.erc20ContractAddress !== token1.erc20ContractAddress,
    );
  }, [selectedChain.currencies, token1]);

  const token1Options = useMemo(() => {
    return selectedChain.currencies.filter(
      (currency) =>
        currency.erc20ContractAddress !== token0.erc20ContractAddress,
    );
  }, [selectedChain.currencies, token0]);

  const {
    amount: amount0,
    onInput: onInput0,
    // isValid: isValid0,
  } = useAssetAmountInput({
    balance: token0Balance?.symbol,
    minimum: "0",
    asset: {
      symbol: token0.coinDenom,
      decimals: token0.coinDecimals,
    },
  });

  const {
    amount: amount1,
    onInput: onInput1,
    // isValid: isValid1,
  } = useAssetAmountInput({
    balance: token1Balance?.symbol,
    minimum: "0",
    asset: token1
      ? {
          symbol: token1.coinDenom,
          decimals: token1.coinDecimals,
        }
      : undefined,
  });

  // TODO: Debounce.
  useEffect(() => {
    if (!input0Token || !input1Token) {
      return;
    }

    (async () => {
      const poolFactoryService = createPoolFactoryService(
        config,
        selectedChain.contracts.poolFactory.address,
      );

      // TODO: Handle native tokens. If one of the tokens is native, we need to get the wrapped token address.
      const address = await poolFactoryService.getPool(
        selectedChain.chainId,
        input0Token.erc20ContractAddress as `0x${string}`,
        input1Token.erc20ContractAddress as `0x${string}`,
        selectedFeeTier,
      );

      // TODO: Handle if pool doesn't exist.
    })();
  }, [
    config,
    input0Token,
    input1Token,
    selectedChain.chainId,
    selectedChain.contracts.poolFactory.address,
    selectedFeeTier,
  ]);

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardContent className="flex items-center justify-between">
          <CardFigureInput value={amount0.value} onInput={handleInput0Change} />
          <div>
            <TokenSelect
              options={token0Options}
              value={token0}
              onValueChange={setToken0}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex items-center justify-between">
          <CardFigureInput
            value={amount1.value}
            onInput={(event) => onInput1({ value: event.currentTarget.value })}
          />
          <div>
            <TokenSelect
              options={token1Options}
              value={token1}
              onValueChange={setToken1}
            />
          </div>
        </CardContent>
      </Card>

      <FeeTierSelect value={selectedFeeTier} onChange={setSelectedFeeTier} />
    </div>
  );
};
