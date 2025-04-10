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
import { useEvmWallet } from "features/evm-wallet";
import { NotificationType, useNotifications } from "features/notifications";

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

  // save the recipient address - simplified
  const handleEditRecipientSave = useCallback(() => {
    setIsRecipientAddressEditable(false);
  }, []);

  // clear the manually inputted recipient address
  const handleEditRecipientClear = useCallback(() => {
    setIsRecipientAddressEditable(false);
    setRecipientAddressOverride("");
  }, []);

  // handle connecting to Cosmos wallet - simplified
  const handleConnectCosmosWallet = useCallback(() => {
    setIsRecipientAddressEditable(false);
    setRecipientAddressOverride("");
    // Simplified mock function
    console.log("Connect Cosmos wallet");
  }, []);

  // Simplified withdraw handler that just shows notifications
  const handleWithdraw = useCallback(async () => {
    setIsLoading(true);
    setIsAnimating(true);

    try {
      // Mock successful withdrawal
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
      addNotification({
        toastOpts: {
          toastType: NotificationType.DANGER,
          component: (
            <>
              <p className="mb-1">Withdrawal failed.</p>
              <p className="message-body-inner">Mock error message</p>
            </>
          ),
          onAcknowledge: () => {},
        },
      });
    } finally {
      setIsLoading(false);
      setTimeout(() => setIsAnimating(false), 1000);
    }
  }, [addNotification]);

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

  // Simplified withdraw button disabled state
  const isWithdrawDisabled = useMemo(() => {
    return !(isAmountValid && isRecipientAddressValid);
  }, [isAmountValid, isRecipientAddressValid]);

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
