"use client";

import { usePathname, useRouter } from "next/navigation";

import { Badge, Button, MultiTokenIcon, Skeleton } from "@repo/ui/components";
import { ArrowLeftIcon } from "@repo/ui/icons";
import { PositionRangeBadge } from "pool/components";
import { usePoolPositionContext } from "pool/hooks";

import { ROUTES } from "../../../constants/routes";

export const HeaderSection = () => {
  const router = useRouter();
  const pathname = usePathname();
  const {
    poolToken0,
    poolToken1,
    feeTier,
    isReversedPoolTokens,
    isPositionClosed,
  } = usePoolPositionContext();
  const poolTokens = isReversedPoolTokens
    ? [poolToken1, poolToken0]
    : [poolToken0, poolToken1];

  return (
    <div className="flex flex-col items-start gap-8 md:gap-4 md:items-center md:justify-between md:flex-row">
      <div className="flex items-baseline relative">
        <div
          onClick={() => router.back()}
          className="mb-10 md:absolute md:-left-10 md:mt-2 md:mb-0"
        >
          <ArrowLeftIcon
            aria-label="Back"
            size={16}
            className="cursor-pointer text-icon-light hover:text-white transition"
          />
        </div>
        <div className="flex flex-col space-y-3">
          <Skeleton
            isLoading={!poolTokens[0]?.token && !poolTokens[1]?.token}
            className="w-full h-[40px]"
          >
            {poolTokens[0]?.token && poolTokens[1]?.token && (
              <div className="flex items-center space-x-2">
                <MultiTokenIcon
                  symbols={[
                    poolTokens[0].token.coinDenom,
                    poolTokens[1].token.coinDenom,
                  ]}
                  size={24}
                />
                <h1 className="text-3xl/8">
                  {poolTokens[0].token.coinDenom}/
                  {poolTokens[1].token.coinDenom}
                </h1>
              </div>
            )}
          </Skeleton>
          <Skeleton
            isLoading={!poolTokens[0]?.token && !poolTokens[1]?.token}
            className="w-full h-[20px]"
          >
            <div className="flex space-x-2">
              <PositionRangeBadge isPositionClosed={isPositionClosed} />
              <Badge variant="default" className="flex items-center space-x-2">
                {feeTier}
              </Badge>
            </div>
          </Skeleton>
        </div>
      </div>
      <div className="flex gap-4">
        <Button
          variant="default"
          size="default"
          onClick={() => router.push(`${pathname}${ROUTES.ADD_LIQUIDITY}`)}
        >
          Add Liquidity
        </Button>
        <Button
          variant="outline"
          size="default"
          onClick={() => router.push(`${pathname}${ROUTES.REMOVE_LIQUIDITY}`)}
        >
          Remove Liquidity
        </Button>
      </div>
    </div>
  );
};
