"use client";

import { usePathname, useRouter } from "next/navigation";

import { Button, MultiTokenIcon, Skeleton } from "@repo/ui/components";
import { Header, HeaderTitle } from "components/header";
import { PositionFeeBadge, PositionRangeBadge } from "pool/components/position";
import { ROUTES } from "pool/constants/routes";
import { useGetPosition } from "pool/hooks/use-get-position";
import { usePoolPositionContext } from "pool/hooks/use-pool-position-context-v2";

export const HeaderSection = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { positionId, invert } = usePoolPositionContext();
  const { data, isPending } = useGetPosition({ positionId, invert });

  return (
    <Header onClickBack={() => router.back()}>
      <div className="flex flex-col w-full gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col space-y-3">
          <Skeleton isLoading={isPending} className="w-48 h-8">
            {data && (
              <div className="flex flex-col gap-2 md:flex-row md:items-center">
                <div className="flex items-center gap-2">
                  <MultiTokenIcon
                    symbols={[data?.token0.coinDenom, data?.token1.coinDenom]}
                  />
                  <HeaderTitle>
                    {data.token0.coinDenom}/{data.token1.coinDenom}
                  </HeaderTitle>
                </div>

                <div className="flex gap-2">
                  <PositionRangeBadge
                    position={data.position}
                    price={data.price}
                  />
                  <PositionFeeBadge position={data.position} />
                </div>
              </div>
            )}
          </Skeleton>
        </div>

        <div className="flex gap-4">
          <Button
            variant="secondary"
            onClick={() => router.push(`${pathname}${ROUTES.REMOVE_LIQUIDITY}`)}
            disabled={isPending}
          >
            Remove Liquidity
          </Button>
          <Button
            onClick={() => router.push(`${pathname}${ROUTES.ADD_LIQUIDITY}`)}
            disabled={isPending}
          >
            Add Liquidity
          </Button>
        </div>
      </div>
    </Header>
  );
};
