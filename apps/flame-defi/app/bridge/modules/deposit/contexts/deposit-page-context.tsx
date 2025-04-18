"use client";

import React, {
  createContext,
  PropsWithChildren,
  useCallback,
  useMemo,
  useState,
  useEffect,
} from "react";
import { useConfig } from "wagmi";

import {
  CosmosChainInfo,
  EvmChainInfo,
  EvmCurrency,
  HexString,
  IbcCurrency,
} from "@repo/flame-types";
import { useCosmosWallet } from "features/cosmos-wallet";
import { useEvmWallet } from "features/evm-wallet";
import { NotificationType, useNotifications } from "features/notifications";
import { useBridgeConnections } from "../../../hooks/use-bridge-connections";
import { createDepositStrategy } from "../strategies/deposit-strategies";
import { ChainConnection } from "../../../types";

export interface DepositPageContextProps extends PropsWithChildren {
  // TODO - refactor content-section to just use useBridgeConnections directly
  sourceChainSelection: ChainConnection;
  destinationChainSelection: ChainConnection;
  handleSourceChainSelect: (chainValue: CosmosChainInfo | EvmChainInfo) => void;
  handleDestinationChainSelect: (
    chainValue: CosmosChainInfo | EvmChainInfo,
  ) => void;
  setSourceCurrency: (currency: EvmCurrency | IbcCurrency | null) => void;
  setDestinationCurrency: (currency: EvmCurrency | IbcCurrency | null) => void;
  // TODO - move to useDepositForm hook or similar
  amount: string;
  setAmount: (value: string) => void;
  isAmountValid: boolean;
  setIsAmountValid: (value: boolean) => void;
  hasTouchedForm: boolean;
  setHasTouchedForm: (value: boolean) => void;
  isLoading: boolean;
  setIsLoading: (value: boolean) => void;
  isAnimating: boolean;
  setIsAnimating: (value: boolean) => void;
  // TODO - either refactor into useDepositForm or useBridgeConnections
  recipientAddressOverride: string;
  setRecipientAddressOverride: (value: string) => void;
  isRecipientAddressEditable: boolean;
  setIsRecipientAddressEditable: (value: boolean) => void;
  isRecipientAddressValid: boolean;
  setIsRecipientAddressValid: (value: boolean) => void;
  handleEditRecipientClick: () => void;
  handleEditRecipientSave: () => void;
  handleEditRecipientClear: () => void;
  // TODO - move to hook useDepositTransaction
  handleDeposit: () => Promise<void>;
  isDepositDisabled: boolean;
  // TODO - remove wallets from this context
  cosmosWallet: ReturnType<typeof useCosmosWallet>;
  evmWallet: ReturnType<typeof useEvmWallet>;
}

export const DepositPageContext = createContext<
  DepositPageContextProps | undefined
>(undefined);

export const DepositPageContextProvider = ({ children }: PropsWithChildren) => {
  const { addNotification } = useNotifications();
  const wagmiConfig = useConfig();

  // Use our new bridge connections hook
  const bridgeConnections = useBridgeConnections();
  const {
    sourceConnection,
    destinationConnection,
    connectSource,
    connectDestination,
    setSourceCurrency,
    setDestinationCurrency,
    // TODO - can probably cleanup the manual address override logic and state
    recipientAddress,
    setRecipientAddress: setBridgeConnectionsRecipientAddress,
    isManualAddressMode,
    enableManualAddressMode,
    disableManualAddressMode,
    cosmosWallet,
    evmWallet,
  } = bridgeConnections;

  // form state
  const [amount, setAmount] = useState<string>("");
  const [isAmountValid, setIsAmountValid] = useState<boolean>(false);
  const [isRecipientAddressValid, setIsRecipientAddressValid] =
    useState<boolean>(false);
  const [hasTouchedForm, setHasTouchedForm] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);

  // recipient address manual override state
  const [recipientAddressOverride, setRecipientAddressOverride] =
    useState<string>("");
  const [isRecipientAddressEditable, setIsRecipientAddressEditable] =
    useState<boolean>(false);

  // Sync manual address state with hook state
  useEffect(() => {
    setRecipientAddressOverride(recipientAddress);
  }, [recipientAddress]);

  useEffect(() => {
    setIsRecipientAddressEditable(isManualAddressMode);
  }, [isManualAddressMode]);

  // When our internal state changes, update the hook
  const setRecipientAddressOverrideHandler = useCallback(
    (value: string) => {
      setRecipientAddressOverride(value);
      setBridgeConnectionsRecipientAddress(value);
    },
    [setBridgeConnectionsRecipientAddress],
  );

  const setIsRecipientAddressEditableHandler = useCallback(
    (value: boolean) => {
      setIsRecipientAddressEditable(value);
      if (value) {
        enableManualAddressMode();
      } else {
        disableManualAddressMode();
      }
    },
    [enableManualAddressMode, disableManualAddressMode],
  );

  // toggle ability to edit recipient address
  const handleEditRecipientClick = useCallback(() => {
    setIsRecipientAddressEditableHandler(!isRecipientAddressEditable);
  }, [isRecipientAddressEditable, setIsRecipientAddressEditableHandler]);

  // save the recipient address
  const handleEditRecipientSave = useCallback(() => {
    setIsRecipientAddressEditableHandler(false);
  }, [setIsRecipientAddressEditableHandler]);

  // clear the manually inputted recipient address
  const handleEditRecipientClear = useCallback(() => {
    setIsRecipientAddressEditableHandler(false);
    setRecipientAddressOverrideHandler("");
  }, [
    setIsRecipientAddressEditableHandler,
    setRecipientAddressOverrideHandler,
  ]);

  const handleDeposit = async () => {
    const recipientAddress = (recipientAddressOverride ||
      evmWallet.evmAccountAddress) as HexString;

    // common validation
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
    setIsAnimating(true);

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
    } catch (e) {
      setIsAnimating(false);
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
    } finally {
      setIsLoading(false);
      setTimeout(() => setIsAnimating(false), 1000);
    }
  };

  // We no longer define options here, instead using useDepositOptions in the components

  // calculate if deposit button should be disabled
  const isDepositDisabled = useMemo<boolean>((): boolean => {
    if (recipientAddressOverride) {
      return !(isAmountValid && isRecipientAddressValid);
    }

    return !(
      isAmountValid &&
      isRecipientAddressValid &&
      sourceConnection.address &&
      sourceConnection.currency?.coinDenom ===
        destinationConnection.currency?.coinDenom
    );
  }, [
    destinationConnection.currency?.coinDenom,
    isAmountValid,
    isRecipientAddressValid,
    recipientAddressOverride,
    sourceConnection.address,
    sourceConnection.currency?.coinDenom,
  ]);

  return (
    <DepositPageContext.Provider
      value={{
        sourceChainSelection: sourceConnection,
        handleSourceChainSelect: connectSource,
        destinationChainSelection: destinationConnection,
        handleDestinationChainSelect: connectDestination,
        setSourceCurrency,
        setDestinationCurrency,
        amount,
        setAmount,
        isAmountValid,
        setIsAmountValid,
        hasTouchedForm,
        setHasTouchedForm,
        isLoading,
        setIsLoading,
        isAnimating,
        setIsAnimating,
        recipientAddressOverride,
        setRecipientAddressOverride: setRecipientAddressOverrideHandler,
        isRecipientAddressEditable,
        setIsRecipientAddressEditable: setIsRecipientAddressEditableHandler,
        isRecipientAddressValid,
        setIsRecipientAddressValid,
        handleEditRecipientClick,
        handleEditRecipientSave,
        handleEditRecipientClear,
        handleDeposit,
        isDepositDisabled,
        cosmosWallet,
        evmWallet,
      }}
    >
      {children}
    </DepositPageContext.Provider>
  );
};
