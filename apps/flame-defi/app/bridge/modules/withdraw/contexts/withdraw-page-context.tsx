"use client";

import { createContext, PropsWithChildren, useMemo, useState } from "react";
import { useNotifications } from "features/notifications";
import { useCosmosWallet } from "features/cosmos-wallet";
import { useEvmWallet } from "features/evm-wallet";
import { useConfig as useWagmiConfig } from "wagmi";

type Status = "error" | "empty" | "success";

export interface WithdrawPageContextProps extends PropsWithChildren {
  amount: string;
  setAmount: (value: string) => void;
  isAmountValid: boolean;
  hasTouchedForm: boolean;
  isLoading: boolean;
  setIsLoading: (value: boolean) => void;
  isAnimating: boolean;
  setIsAnimating: (value: boolean) => void;
  recipientAddressOverride: string;
  setRecipientAddressOverride: (value: string) => void;
  isRecipientAddressEditable: boolean;
  setIsRecipientAddressEditable: (value: boolean) => void;
  handleEditRecipientClick: () => void;
  handleEditRecipientSave: () => void;
  handleEditRecipientClear: () => void;
  handleConnectCosmosWallet: () => void;
  handleWithdraw: () => Promise<void>;
  isWithdrawDisabled: boolean;
  cosmosWallet: ReturnType<typeof useCosmosWallet>;
  evmWallet: ReturnType<typeof useEvmWallet>;
  additionalIbcOptions: Array<{
    label: string;
    action: () => void;
    className: string;
    leftIconClass?: string;
    rightIconClass?: string;
  }>;
  additionalEvmOptions: Array<{
    label: string;
    action: () => void;
    className: string;
    rightIconClass?: string;
  }>;
}

export const WithdrawPageContext = createContext<
  WithdrawPageContextProps | undefined
>(undefined);

export const WithdrawPageContextProvider = ({
  children,
}: PropsWithChildren) => {
  const wagmiConfig = useWagmiConfig();
  const { addNotification } = useNotifications();

  // Form state
  const [amount, setAmount] = useState<string>("");
  const [isAmountValid, setIsAmountValid] = useState<boolean>(false);
  const [isRecipientAddressValid, setIsRecipientAddressValid] =
    useState<boolean>(false);
  const [hasTouchedForm, setHasTouchedForm] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);

  // Recipient address state
  const [recipientAddressOverride, setRecipientAddressOverride] =
    useState<string>("");
  const [isRecipientAddressEditable, setIsRecipientAddressEditable] =
    useState<boolean>(false);

  // Wallet contexts
  const cosmosWallet = useCosmosWallet();
  const evmWallet = useEvmWallet();

  // Handle editing recipient address
  const handleEditRecipientClick = () => {
    setIsRecipientAddressEditable(!isRecipientAddressEditable);
  };

  const handleEditRecipientSave = () => {
    setIsRecipientAddressEditable(false);
    // reset wallet states when user manually enters address
    cosmosWallet.resetState();
  };

  const handleEditRecipientClear = () => {
    setIsRecipientAddressEditable(false);
    setRecipientAddressOverride("");
  };

  // Handle connecting to Cosmos wallet
  const handleConnectCosmosWallet = () => {
    setIsRecipientAddressEditable(false);
    setRecipientAddressOverride("");
    cosmosWallet.connectCosmosWallet();
  };

  // Handle withdraw action
  const handleWithdraw = async () => {
    const recipientAddress =
      recipientAddressOverride || cosmosWallet.cosmosAccountAddress;

    // Implementation kept in content-section.tsx for now
    // This is a stub that will be completed in the content section
    console.log("Handle withdraw action", {
      fromAddress: evmWallet.evmAccountAddress,
      recipientAddress,
      amount,
    });
  };

  // dropdown options
  const additionalIbcOptions = useMemo(
    () => [
      {
        label: "Connect Keplr Wallet",
        action: handleConnectCosmosWallet,
        className: "has-text-primary",
        leftIconClass: "i-cosmos",
        rightIconClass: "fas fa-plus",
      },
      {
        label: "Enter address manually",
        action: handleEditRecipientClick,
        className: "has-text-primary",
        rightIconClass: "fas fa-pen-to-square",
      },
    ],
    [handleConnectCosmosWallet, handleEditRecipientClick],
  );

  const additionalEvmOptions = useMemo(() => {
    return [
      {
        label: "Connect EVM Wallet",
        action: evmWallet.connectEvmWallet,
        className: "has-text-primary",
        rightIconClass: "fas fa-plus",
      },
    ];
  }, [evmWallet.connectEvmWallet]);

  // Calculate if withdraw button should be disabled
  const isWithdrawDisabled = useMemo<boolean>((): boolean => {
    if (recipientAddressOverride) {
      // there won't be a selected ibc chain and currency if user manually enters a recipient address
      return !(
        isAmountValid &&
        isRecipientAddressValid &&
        evmWallet.evmAccountAddress
      );
    }
    return !(
      cosmosWallet.cosmosAccountAddress &&
      isAmountValid &&
      isRecipientAddressValid &&
      evmWallet.evmAccountAddress &&
      evmWallet.selectedEvmCurrency?.coinDenom ===
        cosmosWallet.selectedIbcCurrencyOption?.value?.coinDenom
    );
  }, [
    recipientAddressOverride,
    cosmosWallet.cosmosAccountAddress,
    cosmosWallet.selectedIbcCurrencyOption,
    isAmountValid,
    isRecipientAddressValid,
    evmWallet.evmAccountAddress,
    evmWallet.selectedEvmCurrency,
  ]);

  return (
    <WithdrawPageContext.Provider
      value={{
        amount,
        setAmount,
        isAmountValid,
        hasTouchedForm,
        isLoading,
        setIsLoading,
        isAnimating,
        setIsAnimating,
        recipientAddressOverride,
        setRecipientAddressOverride,
        isRecipientAddressEditable,
        setIsRecipientAddressEditable,
        handleEditRecipientClick,
        handleEditRecipientSave,
        handleEditRecipientClear,
        handleConnectCosmosWallet,
        handleWithdraw,
        isWithdrawDisabled,
        cosmosWallet,
        evmWallet,
        additionalIbcOptions,
        additionalEvmOptions,
      }}
    >
      {children}
    </WithdrawPageContext.Provider>
  );
};
