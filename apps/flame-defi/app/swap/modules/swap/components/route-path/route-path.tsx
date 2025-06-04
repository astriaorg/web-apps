"use client";

import { useIntl } from "react-intl";

import { V3PoolInRoute } from "@repo/flame-types";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@repo/ui/components";
import { MultiTokenIcon, Skeleton, TokenIcon } from "@repo/ui/components";
import { PathIcon } from "@repo/ui/icons";

interface RoutePathProps {
  quoteRoute: Array<V3PoolInRoute[]>;
  loading?: boolean;
  symbolIn?: string;
  symbolOut?: string;
  networkFee?: string;
}

export function parseRouteData(route: Array<V3PoolInRoute[]>) {
  const result = [];

  for (const subRoute of route) {
    for (const step of subRoute) {
      const symbolOne = step.tokenIn.symbol;
      const symbolTwo = step.tokenOut.symbol;
      // Convert Uniswap v3 fee to decimal (500 => 0.05, 10000 => 1.0, etc.)
      const feeDecimal = Number(step.fee) / 10000;
      // Format to a string (e.g. "0.05" or "1.00")
      const percent = feeDecimal.toFixed(2);
      result.push({ symbolOne, symbolTwo, percent });
    }
  }
  return result;
}

export const RoutePath = ({
  quoteRoute,
  loading,
  symbolIn,
  symbolOut,
  networkFee,
}: RoutePathProps) => {
  const routeData = parseRouteData(quoteRoute);
  const { formatNumber } = useIntl();

  return (
    <Accordion type="single" collapsible>
      <AccordionItem
        value="transaction-details"
        className="text-typography-subdued text-sm border-b-0"
      >
        <Skeleton isLoading={loading}>
          <div className="flex items-center justify-between">
            <AccordionTrigger className="flex items-center gap-2 px-3 py-2 text-typography-subdued font-medium rounded-xl border border-typography-subdued">
              <PathIcon size={20} />
              Auto Router
            </AccordionTrigger>
          </div>
        </Skeleton>
        <AccordionContent className="relative">
          <div className="relative flex items-center gap-1 md:gap-2 justify-between w-full px-0 py-4 md:p-4">
            <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 border-b-4 border-dotted border-stroke-default overflow-hidden" />
            <div className="flex items-center gap-2">
              {symbolIn && <TokenIcon symbol={symbolIn} className="z-10" />}
              <div className="text-xs md:text-sm z-10 bg-surface-inverted-subdued rounded-xl p-1 md:p-2 text-typography-inverted">
                100%
              </div>
            </div>
            {routeData.map((item) => (
              <div
                key={item.symbolOne}
                className="text-xs md:text-sm flex items-center gap-2 z-10 bg-surface-inverted-subdued rounded-xl p-1 md:p-2 text-typography-inverted"
              >
                {item.symbolOne && item.symbolTwo && (
                  <MultiTokenIcon symbols={[item.symbolOne, item.symbolTwo]} />
                )}
                {formatNumber(parseFloat(item.percent))}%
              </div>
            ))}
            {symbolOut && <TokenIcon symbol={symbolOut} className="z-10" />}
          </div>
          <div className="flex items-center gap-2 w-full px-4">
            <span>{`Best price route costs <$ ${networkFee} in gas. This route optimizes your total output by considering split routes, multiple hops, and the gas cost of each step.`}</span>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};
