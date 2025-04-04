"use client";

import { Badge, Button, MultiTokenIcon, Skeleton } from "@repo/ui/components";
import { ArrowLeftIcon, DotIcon } from "@repo/ui/icons";
import { usePathname, useRouter } from "next/navigation";
import { usePoolPositionContext } from "pool/hooks";
import { ROUTES } from "../../../constants/routes";

export const HeaderSection = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { poolTokenOne, poolTokenTwo, feeTier } = usePoolPositionContext();
  const symbolsReady =
    poolTokenOne?.token.coinDenom && poolTokenTwo?.token.coinDenom;

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
          <Skeleton isLoading={!symbolsReady} className="w-full h-[40px]">
            {symbolsReady && (
              <div className="flex items-center space-x-2">
                <MultiTokenIcon
                  symbols={[
                    poolTokenOne.token.coinDenom,
                    poolTokenTwo.token.coinDenom,
                  ]}
                  size={24}
                />
                <h1 className="text-3xl/8">
                  {poolTokenOne.token.coinDenom}/{poolTokenTwo.token.coinDenom}
                </h1>
              </div>
            )}
          </Skeleton>
          <Skeleton isLoading={!symbolsReady} className="w-full h-[20px]">
            <div className="flex space-x-2">
              <Badge
                variant="default"
                className="flex items-center space-x-2 z-2"
              >
                <DotIcon size={12} className="fill-green z-999999999" />
                <span>In range</span>
              </Badge>
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
