import { useCallback, useMemo } from "react";
import { useIntl } from "react-intl";

import {
  Card,
  CardContent,
  CardFigureLabel,
  CardLabel,
  Skeleton,
  Tabs,
  TabsList,
  TabsTrigger,
} from "@repo/ui/components";
import { PositionRangeBadge } from "pool/components/position";
import { useGetPosition } from "pool/hooks/use-get-position";
import { usePoolPositionContext as usePoolPositionContextV2 } from "pool/hooks/use-pool-position-context-v2";
import { getDisplayMaxPrice, getDisplayMinPrice } from "pool/utils";

const PricePerTokenLabel = () => {
  const { tokenId, invert } = usePoolPositionContextV2();
  const { data } = useGetPosition({ tokenId, invert });

  return (
    <CardLabel className="text-xs">
      {data?.token0.coinDenom} per {data?.token1.coinDenom}
    </CardLabel>
  );
};

export const PriceRangeSummary = () => {
  const { formatNumber } = useIntl();
  const { tokenId, invert, setInvert } = usePoolPositionContextV2();
  const { data, isPending } = useGetPosition({ tokenId, invert });

  const tokens = useMemo(() => {
    // Return tokens in a consistent order, so they aren't affected by inversion.
    if (!data) {
      return [];
    }
    // Default to the order returned by the position.
    if (data.position.token0 === data.token0.asToken().address) {
      return [data.token0, data.token1];
    }
    return [data.token1, data.token0];
  }, [data]);

  const handleInvert = useCallback(
    (value: string) => {
      const token = tokens.find((it) => it.coinDenom === value);
      if (!token) {
        return;
      }
      setInvert(data?.position.token0 === token.asToken().address);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [tokens, data],
  );

  return (
    <div className="mt-8">
      <div className="flex items-center gap-2 mb-6">
        <Skeleton isLoading={isPending} className="h-8 w-full">
          <h2 className="font-semibold">Price Range</h2>
        </Skeleton>
        {data && (
          <>
            <div className="flex-1">
              <PositionRangeBadge position={data.position} />
            </div>
            <Tabs
              defaultValue={data.token1.coinDenom}
              // value={data.token0.coinDenom}
              onValueChange={handleInvert}
            >
              <TabsList>
                {tokens.map((it, index) => (
                  <TabsTrigger
                    key={`price-range-summary_token-${index}`}
                    value={it.coinDenom}
                  >
                    {it.coinDenom}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card
          variant="secondary"
          isLoading={isPending}
          className="col-span-1 md:col-span-2"
        >
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="flex flex-col gap-1">
                <CardLabel className="text-xs font-medium tracking-wider uppercase">
                  Min Price
                </CardLabel>
                <CardFigureLabel className="text-typography-light font-sans">
                  {getDisplayMinPrice(data?.minPrice ?? "0", {
                    minimumFractionDigits: 4,
                  })}
                </CardFigureLabel>
                <PricePerTokenLabel />
                <CardLabel className="text-xs text-typography-subdued">
                  Your position will be 100% {data?.token1.coinDenom} at this
                  price.
                </CardLabel>
              </div>
              <div className="flex flex-col gap-1">
                <CardLabel className="text-xs uppercase">Max Price</CardLabel>
                {/* Use sans instead of dot font because the dot font infinity symbol looks weird. */}
                <CardFigureLabel className="text-typography-light font-sans">
                  {getDisplayMaxPrice(data?.maxPrice ?? "0", {
                    minimumFractionDigits: 4,
                  })}
                </CardFigureLabel>
                <PricePerTokenLabel />
                <CardLabel className="text-xs text-typography-subdued">
                  Your position will be 100% {data?.token0.coinDenom} at this
                  price.
                </CardLabel>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card variant="accent" isLoading={isPending}>
          <CardContent className="h-full">
            <div className="flex flex-col gap-1 h-full">
              <CardLabel className="text-xs font-medium tracking-wider uppercase">
                Current Price
              </CardLabel>
              <CardFigureLabel className="truncate">
                {formatNumber(Number(data?.price ?? 0), {
                  minimumFractionDigits: 4,
                  maximumFractionDigits: 4,
                  roundingMode: "trunc",
                })}
              </CardFigureLabel>
              <div className="flex-1" />
              <PricePerTokenLabel />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
