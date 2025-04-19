"use client";

import { useState, useCallback } from "react";
import { useConfig } from "wagmi";

import { HexString } from "@repo/flame-types";
import { useCosmosWallet } from "features/cosmos-wallet";
import { NotificationType, useNotifications } from "features/notifications";

import { createDepositStrategy } from "bridge/modules/deposit/strategies/deposit-strategies";
import { ChainConnection } from "bridge/types";

export interface DepositTransactionState {
  isLoading: boolean;
}

export interface DepositTransactionHook extends DepositTransactionState {
  executeDeposit: (params: {
    amount: string;
    sourceConnection: ChainConnection;
    destinationConnection: ChainConnection;
    recipientAddressOverride?: string;
    onSuccess?: () => void;
    onError?: () => void;
  }) => Promise<void>;
}

export function useDepositTransaction(): DepositTransactionHook {
  const { addNotification } = useNotifications();
  const wagmiConfig = useConfig();
  const cosmosWallet = useCosmosWallet();

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const executeDeposit = useCallback(
    async ({
      amount,
      sourceConnection,
      destinationConnection,
      recipientAddressOverride,
      onSuccess,
      onError,
    }: {
      amount: string;
      sourceConnection: ChainConnection;
      destinationConnection: ChainConnection;
      recipientAddressOverride?: string;
      onSuccess?: () => void;
      onError?: () => void;
    }): Promise<void> => {
      // Use either manual recipient address or the destination chain address
      const recipientAddress = (recipientAddressOverride ||
        destinationConnection.address) as HexString;

      // Basic validation
      if (!sourceConnection.address || !recipientAddress) {
        addNotification({
          toastOpts: {
            toastType: NotificationType.WARNING,
            message: "Please connect your wallets first.",
            onAcknowledge: () => {},
          },
        });
        return;
      }

      setIsLoading(true);

      try {
        const depositStrategy = createDepositStrategy({
          amount,
          sourceConnection,
          cosmosWallet,
          wagmiConfig,
        });

        await depositStrategy.execute(recipientAddress);

        addNotification({
          toastOpts: {
            toastType: NotificationType.SUCCESS,
            message: "Deposit successful!",
            onAcknowledge: () => {},
          },
        });

        if (onSuccess) {
          onSuccess();
        }

        return;
      } catch (e) {
        if (onError) {
          onError();
        }
        console.error("Deposit failed", e);
        const message = e instanceof Error ? e.message : "Unknown error.";

        // display appropriate error message
        if (/failed to get account from keplr wallet/i.test(message)) {
          addNotification({
            toastOpts: {
              toastType: NotificationType.DANGER,
              message:
                "Failed to get account from Keplr wallet. Does this address have funds for the selected chain?",
              onAcknowledge: () => {},
            },
          });
        } else {
          addNotification({
            toastOpts: {
              toastType: NotificationType.DANGER,
              component: (
                <>
                  <p className="mb-1">Deposit failed.</p>
                  <p className="message-body-inner">{message}</p>
                </>
              ),
              onAcknowledge: () => {},
            },
          });
        }

        return;
      } finally {
        setIsLoading(false);
      }
    },
    [addNotification, cosmosWallet, wagmiConfig],
  );

  return {
    isLoading,
    executeDeposit,
  };
}
