"use client";

import React from "react";
import { useAccount } from "wagmi";

import { Button } from "@repo/ui/components";
import { WalletIcon } from "@repo/ui/icons";
import { useCosmosWallet } from "features/cosmos-wallet";
import { BridgeConnectionsModal } from "bridge/components/bridge-connections-modal";

/**
 * A button for opening the BridgeConnectionsModal
 * with a dynamic label depending on connection statuses.
 */
export const ManageWalletsButton: React.FC = () => {
  const { cosmosAccountAddress } = useCosmosWallet();
  const { isConnected: isEvmWalletConnected } = useAccount();

  const hasConnections = cosmosAccountAddress || isEvmWalletConnected;
  const buttonText = hasConnections ? "Wallets" : "Connect Wallets";
  return (
    <BridgeConnectionsModal>
      <Button variant="secondary" size="sm" className="flex items-center gap-2">
        <WalletIcon size={16} />
        <span>{buttonText}</span>
      </Button>
    </BridgeConnectionsModal>
  );
};
