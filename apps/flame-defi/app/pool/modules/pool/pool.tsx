"use client";

import { useRouter } from "next/navigation";
import { usePoolContext } from "pool/hooks";
import type React from "react";
import { useAccount } from "wagmi";

import { Button, Skeleton } from "@repo/ui/components";
import { InboxIcon, PlusIcon } from "@repo/ui/icons";
import { useAstriaWallet } from "features/evm-wallet";

import { ROUTES } from "../../constants/routes";
import { PositionsTable } from "./components";

export const Pool = (): React.ReactElement => {
  const { connectWallet } = useAstriaWallet();
  const { poolPositions, poolPositionsLoading } = usePoolContext();
  const router = useRouter();
  const userAccount = useAccount();

  return (
    <div className="w-full mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-lg md:text-2xl font-medium">Pools</h2>
        {userAccount.address && (
          <Button
            onClick={() => router.push(ROUTES.CREATE_POSITION)}
            className="mt-0 flex items-center"
          >
            <PlusIcon />
            New Position
          </Button>
        )}
      </div>
      <div className="flex flex-col bg-surface-1 w-full rounded-lg">
        {poolPositions.length > 0 && (
          <Skeleton isLoading={poolPositionsLoading}>
            <PositionsTable />
          </Skeleton>
        )}
        {poolPositions.length === 0 && (
          <Skeleton isLoading={poolPositionsLoading}>
            <div className="flex flex-col items-center justify-center h-[250px]">
              <InboxIcon size={50} className="mb-2 text-text-subdued" />
              <p className="mb-10 text-lg text-text-subdued">
                Your active V3 liquidity positions will appear here.
              </p>
              {!userAccount.address && (
                <Button className="mt-0" onClick={() => connectWallet()}>
                  Connect Wallet
                </Button>
              )}
            </div>
          </Skeleton>
        )}
      </div>
    </div>
  );
};
