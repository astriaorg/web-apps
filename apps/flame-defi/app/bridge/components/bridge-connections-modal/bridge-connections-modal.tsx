"use client";

import React, { useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from "@repo/ui/components";
import { CloseIcon } from "@repo/ui/icons";
import {
  ConnectCosmosWalletButton,
  useCosmosWallet,
} from "features/cosmos-wallet";
import { ConnectEvmWalletButton, useAstriaWallet } from "features/evm-wallet";

interface BridgeConnectionsModalProps {
  children?: React.ReactNode;
  title?: string;
}

export function BridgeConnectionsModal({
  children,
  title = "Connect Wallets",
}: BridgeConnectionsModalProps): React.ReactElement {
  const [open, setOpen] = useState(false);
  const cosmosWallet = useCosmosWallet();
  const astriaWallet = useAstriaWallet();

  // const handleOpenModal = () => {
  //   setOpen(true);
  // };

  const handleCloseModal = () => {
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children || <div />}</DialogTrigger>

      <DialogPortal>
        <DialogContent className="p-4 md:p-8 bg-radial-dark w-[90%] md:w-[90%] lg:w-[500px] [&>button]:hidden fixed top-[50%] left-[50%] -translate-x-[50%] -translate-y-[50%] transition rounded-xl z-50">
          <div className="flex items-center justify-between mb-6">
            <div>
              <DialogTitle>{title}</DialogTitle>
              <DialogDescription className="sr-only">
                Connect your Ethereum and Cosmos wallets to use bridge
                functionality
              </DialogDescription>
            </div>
            <button onClick={handleCloseModal} aria-label="Close dialog">
              <CloseIcon className="text-grey-light hover:text-white transition" />
            </button>
          </div>
          <div className="flex flex-col gap-4">
            {astriaWallet.accountAddress ? (
              <div className="mb-2">
                <ConnectEvmWalletButton />
              </div>
            ) : (
              //  bad stop gap solution b/c can't click on 3rd party modal opened
              //  from shadcn Dialog. attempting to close this modal before opening evm modal,
              //  but i think the timing is off. it's still buggy.
              // NOTE - this has actually been performing fine? still room for improvement
              <div className="mb-2" onClick={handleCloseModal}>
                <ConnectEvmWalletButton />
              </div>
            )}
            {cosmosWallet.cosmosAccountAddress ? (
              <div>
                <ConnectCosmosWalletButton />
              </div>
            ) : (
              <div onClick={handleCloseModal}>
                <ConnectCosmosWalletButton />
              </div>
            )}
          </div>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}
