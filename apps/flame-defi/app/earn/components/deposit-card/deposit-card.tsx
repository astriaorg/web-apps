import Big from "big.js";
import React from "react";
import { useAccount } from "wagmi";

import {
  type Amount,
  Badge,
  Card,
  CardContent,
  CardFigureInput,
  CardLabel,
  Skeleton,
} from "@repo/ui/components";
import { useFormatAbbreviatedNumber } from "@repo/ui/hooks";
import { Image } from "components/image";
import type { Asset, Maybe } from "earn/generated/gql/graphql";

interface DepositCardProps {
  asset?: Maybe<Pick<Asset, "logoURI" | "name" | "symbol" | "priceUsd">>;
  title: React.ReactNode;
  amount: Amount;
  balance: string;
  isLoading: boolean;
  onInput: ({ value }: { value: string }) => void;
}

export const DepositCard = ({
  asset,
  title,
  amount,
  balance,
  isLoading,
  onInput,
}: DepositCardProps) => {
  const { isConnected } = useAccount();
  const { formatAbbreviatedNumber } = useFormatAbbreviatedNumber();

  return (
    <Card isLoading={isLoading}>
      <CardContent className="space-y-2">
        <CardLabel>
          <span className="flex-1 truncate">
            {title}
            &nbsp;
            {asset?.symbol}
          </span>
          <div>
            <Image
              src={asset?.logoURI}
              alt={asset?.name}
              width={16}
              height={16}
              className="rounded-full"
            />
          </div>
        </CardLabel>
        <CardFigureInput
          value={amount.value}
          onInput={(event) => onInput({ value: event.currentTarget.value })}
          readOnly={!isConnected}
        />
        <Skeleton isLoading={isLoading}>
          <div className="flex items-center space-x-4 h-5">
            <span className="text-typography-light text-sm/3 flex-1">
              {asset?.priceUsd && amount.value
                ? formatAbbreviatedNumber(
                    new Big(asset.priceUsd ?? 0).mul(amount.value).toFixed(),
                    {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                      style: "currency",
                      currency: "USD",
                    },
                    { threshold: "million" },
                  )
                : "-"}
            </span>
            {isConnected && (
              <div className="flex items-center space-x-1 overflow-hidden">
                <span className="text-sm/3 truncate">
                  {formatAbbreviatedNumber(balance, {
                    maximumFractionDigits: 4,
                  })}
                  &nbsp;
                  {asset?.symbol}
                </span>
                <Badge
                  className="hover:cursor-pointer"
                  onClick={() => {
                    onInput({ value: balance });
                  }}
                >
                  Max
                </Badge>
              </div>
            )}
          </div>
        </Skeleton>
      </CardContent>
    </Card>
  );
};
