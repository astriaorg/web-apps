"use client";

import { ActionButton } from "@repo/ui/components";
import { InboxIcon, PlusIcon } from "@repo/ui/icons";
import { useEvmWallet } from "features/evm-wallet";
import type React from "react";
import { useAccount } from "wagmi";
import NewPoolPosition from "./components/new-pool-position";
import { useState } from "react";

export default function PoolPage(): React.ReactElement {
  const { connectEvmWallet } = useEvmWallet();
  // TODO: this is a temporary state to display the new position page
  const [newPositionPage, setNewPositionPage] = useState(false);
  const userAccount = useAccount();

  // TODO: Actually think through how the your positions, connect and new position pages should be displayed

  return (
    <section className="w-full min-h-[calc(100vh-85px-96px)] flex flex-col mt-[100px]">
      <div className="max-w-[700px] w-full mx-auto">
        {userAccount.address && !newPositionPage && (
          <div className="flex items-center justify-end mb-8">
            <ActionButton
              callback={() => setNewPositionPage(true)}
              buttonText="New Position"
              className="mt-0"
              PrefixIcon={PlusIcon}
            />
          </div>
        )}
        {userAccount.address && newPositionPage && (
          <NewPoolPosition
            newPositionPage={newPositionPage}
            setNewPositionPage={setNewPositionPage}
          />
        )}
        {!newPositionPage && (
          <div className="max-w-[800px] w-full mx-auto gradient-container">
            <h2 className="text-lg md:text-2xl font-medium mb-4">
              {newPositionPage ? "Create Position" : "Pools"}
            </h2>
            <div className="flex flex-col bg-semi-white w-full rounded-2xl h-[250px]">
              <div className="flex flex-col items-center justify-center h-full">
                <InboxIcon size={50} className="mb-2" />
                <p className="mb-10">
                  Your active V3 liquidity positions will appear here.
                </p>
                {!userAccount.address && (
                  <ActionButton
                    buttonText="Connect Wallet"
                    className="mt-0"
                    callback={() => connectEvmWallet()}
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
