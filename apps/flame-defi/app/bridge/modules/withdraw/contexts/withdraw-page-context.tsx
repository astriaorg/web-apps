"use client";

import React, {
  createContext,
  PropsWithChildren,
  useCallback,
  useMemo,
  useState,
} from "react";

import { EditIcon, PlusIcon } from "@repo/ui/icons";
import { DropdownAdditionalOption } from "components/dropdown";
import { useCosmosWallet } from "features/cosmos-wallet";
import { createWithdrawerService, useEvmWallet } from "features/evm-wallet";
import { NotificationType, useNotifications } from "features/notifications";
import { useConfig } from "wagmi";

export interface WithdrawPageContextProps extends PropsWithChildren {
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
  recipientAddressOverride: string;
  setRecipientAddressOverride: (value: string) => void;
  isRecipientAddressEditable: boolean;
  setIsRecipientAddressEditable: (value: boolean) => void;
  isRecipientAddressValid: boolean;
  setIsRecipientAddressValid: (value: boolean) => void;
  handleEditRecipientClick: () => void;
  handleEditRecipientSave: () => void;
  handleEditRecipientClear: () => void;
  handleConnectCosmosWallet: () => void;
  handleWithdraw: () => Promise<void>;
  isWithdrawDisabled: boolean;
  additionalCosmosOptions: DropdownAdditionalOption[];
  additionalEvmOptions: DropdownAdditionalOption[];
  cosmosWallet: ReturnType<typeof useCosmosWallet>;
  evmWallet: ReturnType<typeof useEvmWallet>;
}

export const WithdrawPageContext = createContext<
  WithdrawPageContextProps | undefined
>(undefined);

export const WithdrawPageContextProvider = ({
  children,
}: PropsWithChildren) => {
  const { addNotification } = useNotifications();
  const wagmiConfig = useConfig();

  // Form state
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

  // wallet contexts
  const cosmosWallet = useCosmosWallet();
  const evmWallet = useEvmWallet();
  const { connectEvmWallet } = evmWallet;

  // toggle ability to edit recipient address
  const handleEditRecipientClick = useCallback(() => {
    setIsRecipientAddressEditable((prev) => !prev);
  }, []);

  // save the recipient address
  const handleEditRecipientSave = () => {
    setIsRecipientAddressEditable(false);
    // reset wallet states when user manually enters address
    cosmosWallet.resetState();
    // TODO - only reset evm wallet state if recipient had previously
    //  been set from evm wallet connection?
    evmWallet.resetState();
  };

  // clear the manually inputted recipient address
  const handleEditRecipientClear = () => {
    setIsRecipientAddressEditable(false);
    setRecipientAddressOverride("");
  };

  // handle connecting to Cosmos wallet
  const handleConnectCosmosWallet = useCallback(() => {
    setIsRecipientAddressEditable(false);
    setRecipientAddressOverride("");
    cosmosWallet.connectCosmosWallet();
  }, [cosmosWallet]);

  const handleWithdraw = async () => {
    if (!evmWallet.selectedEvmChain || !evmWallet.selectedEvmCurrency) {
      addNotification({
        toastOpts: {
          toastType: NotificationType.WARNING,
          message: "Please select a chain and token to bridge first.",
          onAcknowledge: () => {},
        },
      });
      return;
    }

    const fromAddress = evmWallet.evmAccountAddress;
    const recipientAddress =
      recipientAddressOverride || cosmosWallet.cosmosAccountAddress;
    if (!fromAddress || !recipientAddress) {
      addNotification({
        toastOpts: {
          toastType: NotificationType.WARNING,
          message: "Please connect your Keplr and EVM wallet first.",
          onAcknowledge: () => {},
        },
      });
      return;
    }

    if (
      !evmWallet.selectedEvmCurrency.nativeTokenWithdrawerContractAddress &&
      !evmWallet.selectedEvmCurrency.erc20ContractAddress
    ) {
      console.error("Withdrawal cannot proceed: missing contract address");
      return;
    }

    setIsLoading(true);
    setIsAnimating(true);
    try {
      const contractAddress = evmWallet.selectedEvmCurrency.isNative
        ? evmWallet.selectedEvmCurrency.nativeTokenWithdrawerContractAddress
        : evmWallet.selectedEvmCurrency.erc20ContractAddress;
      if (!contractAddress) {
        throw new Error("No contract address found");
      }
      if (!evmWallet.selectedEvmCurrency.ibcWithdrawalFeeWei) {
        throw new Error("Base withdrawals coming soon but not yet supported.");
      }
      const withdrawerSvc = createWithdrawerService(
        wagmiConfig,
        contractAddress,
        !evmWallet.selectedEvmCurrency.isNative,
      );
      await withdrawerSvc.withdrawToIbcChain(
        evmWallet.selectedEvmChain.chainId,
        recipientAddress,
        amount,
        evmWallet.selectedEvmCurrency.coinDecimals,
        evmWallet.selectedEvmCurrency.ibcWithdrawalFeeWei,
        "",
      );
      addNotification({
        toastOpts: {
          toastType: NotificationType.SUCCESS,
          message: "Withdrawal successful!",
          onAcknowledge: () => {},
        },
      });
    } catch (e) {
      setIsAnimating(false);
      console.error("Withdrawal failed:", e);
      const message = e instanceof Error ? e.message : "Unknown error.";
      addNotification({
        toastOpts: {
          toastType: NotificationType.DANGER,
          component: (
            <>
              <p className="mb-1">Withdrawal failed.</p>
              <p className="message-body-inner">{message}</p>
            </>
          ),
          onAcknowledge: () => {},
        },
      });
    } finally {
      setIsLoading(false);
      setTimeout(() => setIsAnimating(false), 1000);
    }
  };

  // dropdown options for additional Cosmos actions
  const additionalCosmosOptions = useMemo(() => {
    return [
      {
        label: "Connect Keplr Wallet",
        action: handleConnectCosmosWallet,
        className: "has-text-primary",
        leftIconClass: "i-cosmos",
        RightIcon: PlusIcon,
      },
      {
        label: "Enter address manually",
        action: handleEditRecipientClick,
        className: "has-text-primary",
        RightIcon: EditIcon,
      },
    ];
  }, [handleConnectCosmosWallet, handleEditRecipientClick]);

  // dropdown options for additional EVM actions
  const additionalEvmOptions = useMemo(() => {
    return [
      {
        label: "Connect EVM Wallet",
        action: connectEvmWallet,
        className: "has-text-primary",
        RightIcon: PlusIcon,
      },
    ];
  }, [connectEvmWallet]);

  // calculate if withdraw button should be disabled
  const isWithdrawDisabled = useMemo<boolean>((): boolean => {
    if (recipientAddressOverride) {
      // there won't be a selected cosmos chain and currency if user manually
      // enters a recipient address
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
        cosmosWallet.selectedIbcCurrency?.coinDenom
    );
  }, [
    recipientAddressOverride,
    cosmosWallet.cosmosAccountAddress,
    cosmosWallet.selectedIbcCurrency,
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
        setIsAmountValid,
        hasTouchedForm,
        setHasTouchedForm,
        isLoading,
        setIsLoading,
        isAnimating,
        setIsAnimating,
        recipientAddressOverride,
        setRecipientAddressOverride,
        isRecipientAddressEditable,
        setIsRecipientAddressEditable,
        isRecipientAddressValid,
        setIsRecipientAddressValid,
        handleEditRecipientClick,
        handleEditRecipientSave,
        handleEditRecipientClear,
        handleConnectCosmosWallet,
        handleWithdraw,
        isWithdrawDisabled,
        cosmosWallet,
        evmWallet,
        additionalCosmosOptions,
        additionalEvmOptions,
      }}
    >
      {children}
    </WithdrawPageContext.Provider>
  );
};
