"use client";

import React from "react";

import { CosmosWalletProvider } from "features/cosmos-wallet";
import { EvmWalletProvider } from "features/evm-wallet";

export default function BridgeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <EvmWalletProvider>
      <CosmosWalletProvider>
        <section className="w-full min-h-[calc(100vh-85px-96px)] flex flex-col items-center mt-[100px]">
          {children}
        </section>
      </CosmosWalletProvider>
    </EvmWalletProvider>
  );
}
