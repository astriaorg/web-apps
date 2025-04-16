"use client";

import { useState } from "react";
import { CloseIcon } from "@repo/ui/icons";
import {
  Dialog,
  DialogContent,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from "@repo/ui/components";
import { cn } from "@repo/ui/utils";
import { ConnectCosmosWalletButton } from "features/cosmos-wallet/components/connect-cosmos-wallet-button";
import { ConnectEvmWalletButton } from "features/evm-wallet/components/connect-evm-wallet-button";
import { useBridgeConnections } from "../../hooks/use-bridge-connections";

interface BridgeConnectionsModalProps {
  children?: React.ReactNode;
  title?: string;
}

export function BridgeConnectionsModal({
  children,
  title = "Connect Wallets",
}: BridgeConnectionsModalProps): React.ReactElement {
  const [open, setOpen] = useState(false);
  const { evmWallet, cosmosWallet } = useBridgeConnections();

  const handleOpenModal = () => {
    setOpen(true);
  };

  const handleCloseModal = () => {
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children || <div />}</DialogTrigger>

      <DialogPortal>
        <DialogContent className="p-4 md:p-8 bg-radial-dark w-[90%] md:w-[90%] lg:w-[500px] [&>button]:hidden fixed top-[50%] left-[50%] -translate-x-[50%] -translate-y-[50%] transition rounded-xl z-50">
          <div className="flex items-center justify-between mb-6">
            <DialogTitle>{title}</DialogTitle>
            <button onClick={handleCloseModal}>
              <CloseIcon className="text-grey-light hover:text-white transition" />
            </button>
          </div>
          <div className="flex flex-col gap-4">
            {evmWallet.evmAccountAddress ? (
              <div className="mb-2">
                <ConnectEvmWalletButton />
              </div>
            ) : (
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
