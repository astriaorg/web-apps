"use client";

import { Button } from "@repo/ui/components";
import { PlusIcon } from "@repo/ui/icons";
// import { useEvmWallet } from "features/evm-wallet";
import type React from "react";
import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";
import { PositionsTable } from "./components";
import { ROUTES } from "../../constants/routes";

export const Pool = (): React.ReactElement => {
  //   const { connectEvmWallet } = useEvmWallet();
  const router = useRouter();
  const userAccount = useAccount();

  return (
    <div className="w-full mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-lg md:text-2xl font-medium">Pools</h2>
        {userAccount.address && (
          <Button
            onClick={() => router.push(ROUTES.NEW_POSITION)}
            className="mt-0 flex items-center"
          >
            <PlusIcon />
            New Position
          </Button>
        )}
      </div>
      <div className="flex flex-col bg-surface-1 w-full rounded-lg">
        <PositionsTable />
        {/* <div className="flex flex-col items-center justify-center h-[250px]">
                <InboxIcon size={50} className="mb-2 text-text-subdued" />
                <p className="mb-10 text-lg text-text-subdued">
                  Your active V3 liquidity positions will appear here.
                </p>
                {!userAccount.address && (
                  <Button
                    buttonText="Connect Wallet"
                    className="mt-0"
                    callback={() => connectEvmWallet()}
                  />
                )}
              </div> */}
      </div>
    </div>
  );
};
