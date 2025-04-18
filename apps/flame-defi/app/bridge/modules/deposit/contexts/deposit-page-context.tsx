"use client";

import React, {
  createContext,
  PropsWithChildren,
  useCallback,
  useState,
  useEffect,
} from "react";

import { useBridgeConnections } from "bridge/hooks";

export interface DepositPageContextProps extends PropsWithChildren {
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
}

export const DepositPageContext = createContext<
  DepositPageContextProps | undefined
>(undefined);

export const DepositPageContextProvider = ({ children }: PropsWithChildren) => {
  const {
    // TODO - can probably cleanup the manual address override logic and state
    recipientAddress,
    setRecipientAddress: setBridgeConnectionsRecipientAddress,
    isManualAddressMode,
    enableManualAddressMode,
    disableManualAddressMode,
  } = useBridgeConnections();

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

  return (
    <DepositPageContext.Provider
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
        setRecipientAddressOverride: setRecipientAddressOverrideHandler,
        isRecipientAddressEditable,
        setIsRecipientAddressEditable: setIsRecipientAddressEditableHandler,
        isRecipientAddressValid,
        setIsRecipientAddressValid,
        handleEditRecipientClick,
        handleEditRecipientSave,
        handleEditRecipientClear,
      }}
    >
      {children}
    </DepositPageContext.Provider>
  );
};
