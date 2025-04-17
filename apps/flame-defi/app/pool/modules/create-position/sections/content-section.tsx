"use client";

import type { EvmCurrency } from "@repo/flame-types";
import {
  Card,
  CardContent,
  CardFigureInput,
  TokenSelector,
  useAssetAmountInput,
} from "@repo/ui/components";
import { useEvmChainData } from "config";
import { createPoolFactoryService } from "features/evm-wallet";
import { FEE_TIER, type FeeTier } from "pool/constants/pool-constants";
import { useGetPoolTokenBalances } from "pool/hooks";
import { FeeTierSelect } from "pool/modules/create-position/components/fee-tier-select";
import { useEffect, useState } from "react";
import { useConfig } from "wagmi";

export const ContentSection = () => {
  const config = useConfig();
  const { selectedChain } = useEvmChainData();

  const [selectedFeeTier, setSelectedFeeTier] = useState<FeeTier>(
    FEE_TIER.MEDIUM,
  );

  const [input0Token, setInput0Token] = useState<EvmCurrency>(
    selectedChain.currencies[0],
  );
  const [input1Token, setInput1Token] = useState<EvmCurrency>();

  const { token0Balance, token1Balance } = useGetPoolTokenBalances(
    input0Token.coinDenom ?? "",
    input1Token?.coinDenom ?? "",
  );

  const {
    amount: amount0,
    onInput: onInput0,
    // isValid: isValid0,
  } = useAssetAmountInput({
    balance: token0Balance?.symbol,
    minimum: "0",
    asset: {
      symbol: input0Token.coinDenom,
      decimals: input0Token.coinDecimals,
    },
  });

  const {
    amount: amount1,
    onInput: onInput1,
    // isValid: isValid1,
  } = useAssetAmountInput({
    balance: token1Balance?.symbol,
    minimum: "0",
    asset: input1Token
      ? {
          symbol: input1Token.coinDenom,
          decimals: input1Token.coinDecimals,
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
          <CardFigureInput
            value={amount0.value}
            onInput={(event) => onInput0({ value: event.currentTarget.value })}
          />
          <div>
            <TokenSelector
              tokens={selectedChain.currencies}
              selectedToken={input0Token}
              unavailableToken={input1Token}
              setSelectedToken={(token) => setInput0Token(token)}
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
            <TokenSelector
              tokens={selectedChain.currencies}
              selectedToken={input1Token}
              unavailableToken={input0Token}
              setSelectedToken={(token) => setInput1Token(token)}
            />
          </div>
        </CardContent>
      </Card>

      <FeeTierSelect value={selectedFeeTier} onChange={setSelectedFeeTier} />
    </div>
  );
};
