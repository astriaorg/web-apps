"use client";

import type { EvmCurrency } from "@repo/flame-types";
import {
  Card,
  CardContent,
  CardFigureInput,
  TokenSelector,
} from "@repo/ui/components";
import { useEvmChainData } from "config";
import { useState } from "react";

export const ContentSection = () => {
  const {
    selectedChain: { currencies },
  } = useEvmChainData();

  const [input0, setInput0] = useState("");
  const [input1, setInput1] = useState("");
  const [input0Token, setInput0Token] = useState<EvmCurrency>(currencies[0]);
  const [input1Token, setInput1Token] = useState<EvmCurrency>();

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardContent className="flex items-center justify-between">
          <CardFigureInput
            value={input0}
            onInput={(event) => setInput0(event.currentTarget.value)}
          />
          <div>
            <TokenSelector
              tokens={currencies}
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
            value={input1}
            onInput={(event) => setInput1(event.currentTarget.value)}
          />
          <div>
            <TokenSelector
              tokens={currencies}
              selectedToken={input1Token}
              unavailableToken={input0Token}
              setSelectedToken={(token) => setInput1Token(token)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
