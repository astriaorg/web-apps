"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@repo/ui/shadcn-primitives";
import { InfoTooltip } from "@repo/ui/components";
import { GasIcon } from "@repo/ui/icons";
import { TokenState } from "@repo/ui/types";
import { useState } from "react";
import { formatBalanceValues } from "utils/utils";
import { useConfig } from "config";
import useGetQuote from "../useGetQuote";

interface TxnInfoProps {
  inputOne: TokenState;
  inputTwo: TokenState;
}

export const TxnInfo = ({ inputOne, inputTwo }: TxnInfoProps) => {
  const { evmChains } = useConfig();
  const evmChainsData = Object.values(evmChains);
  const chainId = evmChainsData[0]?.chainId;
  // const {amountDecimals, quoteDecimals} = quote
  const [flipDirection, setFlipDirection] = useState(true);
  // TODO: redo this to calculate the token values in the useGetQuote hook
  const tokenData = flipDirection ? [inputOne, inputTwo] : [inputTwo, inputOne];

  const { quote } = useGetQuote(chainId, tokenData[0], tokenData[1]);

  return (
    <Accordion type="single" collapsible>
      <AccordionItem
        value="transaction-details"
        className="text-grey-light text-sm border-b-0"
      >
        <div className="flex items-center justify-between">
          <div
            className="flex items-center cursor-pointer text-white font-medium gap-1"
            onClick={() => setFlipDirection(!flipDirection)}
          >
            <div className="flex items-center gap-1">
              <span>{formatBalanceValues(tokenData[0]?.value)}</span>
              <span>{tokenData[0]?.token?.coinDenom}</span>
            </div>
            <div>=</div>
            <div className="flex items-center gap-1">
              <span>{formatBalanceValues(quote?.quoteDecimals)}</span>
              <span>{tokenData[1]?.token?.coinDenom}</span>
            </div>
          </div>
          <AccordionTrigger>
            <div className="[&>svg]:!transform-none">
              <GasIcon size={20} />
            </div>
          </AccordionTrigger>
        </div>
        <AccordionContent>
          <div className="space-y-2">
            <p className="flex justify-between">
              <span className="text-grey-light flex items-center gap-1">
                Fee (0.25%){" "}
                <InfoTooltip content="Info about fees here" side="right" />
              </span>
              <span className="text-grey-light">$8.15</span>
            </p>
            <p className="flex justify-between">
              <span className="text-grey-light flex items-center gap-1">
                Network cost{" "}
                <InfoTooltip
                  content="Info about networks cost here"
                  side="right"
                />
              </span>
              <span className="text-grey-light">$7.23</span>
            </p>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};
