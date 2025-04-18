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
import { BaseIcon, EditIcon, PlusIcon } from "@repo/ui/icons";
import { DropdownAdditionalOption, DropdownOption } from "components/dropdown";
import { useCosmosWallet } from "features/cosmos-wallet";
import { useEvmWallet } from "features/evm-wallet";
import { NotificationType, useNotifications } from "features/notifications";
import { useBridgeConnections } from "../../../hooks/use-bridge-connections";
import { createDepositStrategy } from "../strategies/deposit-strategies";
import { ChainSelection } from "../../../types";

export interface DepositPageContextProps extends PropsWithChildren {
  sourceChainSelection: ChainSelection;
  destinationChainSelection: ChainSelection;
  handleSourceChainSelect: (chainValue: CosmosChainInfo | EvmChainInfo) => void;
  handleDestinationChainSelect: (
    chainValue: CosmosChainInfo | EvmChainInfo,
  ) => void;
  additionalSourceOptions: DropdownAdditionalOption[];
  sourceChainOptions: DropdownOption<CosmosChainInfo | EvmChainInfo>[];
  additionalDestinationOptions: DropdownAdditionalOption[];
  destinationChainOptions: DropdownOption<CosmosChainInfo | EvmChainInfo>[];
  sourceCurrency: EvmCurrency | IbcCurrency | null;
  setSourceCurrency: (currency: EvmCurrency | IbcCurrency | null) => void;
  destinationCurrency: EvmCurrency | IbcCurrency | null;
  setDestinationCurrency: (currency: EvmCurrency | IbcCurrency | null) => void;
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
  handleDeposit: () => Promise<void>;
  isDepositDisabled: boolean;
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
    setSourceCurrency: setBridgeConnectionsSourceCurrency,
    setDestinationCurrency: setBridgeConnectionsDestinationCurrency,
    // TODO - can probably cleanup the manual address override logic and state
    recipientAddress,
    setRecipientAddress: setBridgeConnectionsRecipientAddress,
    isManualAddressMode,
    enableManualAddressMode,
    disableManualAddressMode,
    cosmosWallet,
    evmWallet,
  } = bridgeConnections;

  // Map hook connections to our existing interface
  const [sourceChainSelection, setSourceChainSelection] =
    useState<ChainSelection>({
      chain: null,
      currency: null,
      address: null,
    });

  const [destinationChainSelection, setDestinationChainSelection] =
    useState<ChainSelection>({
      chain: null,
      currency: null,
      address: null,
    });

  // Keep our local state synced with bridge connections state
  useEffect(() => {
    setSourceChainSelection({
      chain: sourceConnection.chain,
      currency: sourceConnection.currency,
      address: sourceConnection.address,
    });
  }, [sourceConnection]);

  useEffect(() => {
    setDestinationChainSelection({
      chain: destinationConnection.chain,
      currency: destinationConnection.currency,
      address: destinationConnection.address,
    });
  }, [destinationConnection]);

  const [sourceCurrency, setSourceCurrency] = useState<
    EvmCurrency | IbcCurrency | null
  >(null);
  const [destinationCurrency, setDestinationCurrency] = useState<
    EvmCurrency | IbcCurrency | null
  >(null);

  // Keep currency state in sync with bridge connections
  useEffect(() => {
    setSourceCurrency(sourceConnection.currency);
  }, [sourceConnection.currency]);

  useEffect(() => {
    setDestinationCurrency(destinationConnection.currency);
  }, [destinationConnection.currency]);

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

  const setSourceCurrencyHandler = useCallback(
    (currency: EvmCurrency | IbcCurrency | null) => {
      setSourceCurrency(currency);
      setBridgeConnectionsSourceCurrency(currency);
    },
    [setBridgeConnectionsSourceCurrency],
  );

  const setDestinationCurrencyHandler = useCallback(
    (currency: EvmCurrency | IbcCurrency | null) => {
      setDestinationCurrency(currency);
      setBridgeConnectionsDestinationCurrency(currency);
    },
    [setBridgeConnectionsDestinationCurrency],
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

  const handleSourceChainSelect = useCallback(
    (chainValue: CosmosChainInfo | EvmChainInfo) => {
      connectSource(chainValue);
    },
    [connectSource],
  );

  const handleDestinationChainSelect = useCallback(
    (chainValue: CosmosChainInfo | EvmChainInfo) => {
      connectDestination(chainValue);
    },
    [connectDestination],
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
    if (!sourceChainSelection.address || !recipientAddress) {
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
        sourceChainSelection,
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

  // Chain and dropdown options
  const sourceChainOptions = useMemo(() => {
    // Get Cosmos chains from cosmos wallet
    const cosmosChains = cosmosWallet.cosmosChainsOptions || [];

    // Get Coinbase/Base chains from EVM wallet
    const evmChains = evmWallet.coinbaseChains.map((c) => ({
      label: c.chainName,
      value: c,
      LeftIcon: c.IconComponent,
    }));

    return [...cosmosChains, ...evmChains];
  }, [cosmosWallet.cosmosChainsOptions, evmWallet.coinbaseChains]);

  const destinationChainOptions = useMemo(() => {
    return (evmWallet.astriaChains || []).map((c) => ({
      label: c.chainName,
      value: c,
      LeftIcon: c.IconComponent,
    }));
  }, [evmWallet.astriaChains]);

  // Additional dropdown options
  const additionalSourceOptions = useMemo(
    () => [
      {
        label: "Fund with Coinbase OnRamp",
        // TODO - probably need to refactor dropdown to allow passing in of a component.
        //  can then pass in FundCard
        action: () => {
          console.log("Coinbase OnRamp clicked");
        },
        className: "text-white",
        LeftIcon: BaseIcon,
        RightIcon: PlusIcon,
      },
    ],
    [],
  );

  const additionalAstriaChainOptions = useMemo(() => {
    return [
      {
        label: "Enter address manually",
        action: handleEditRecipientClick,
        className: "has-text-primary",
        RightIcon: EditIcon,
      },
    ];
  }, [handleEditRecipientClick]);

  // calculate if deposit button should be disabled
  const isDepositDisabled = useMemo<boolean>((): boolean => {
    if (recipientAddressOverride) {
      return !(isAmountValid && isRecipientAddressValid);
    }

    return !(
      isAmountValid &&
      isRecipientAddressValid &&
      sourceChainSelection.address &&
      sourceCurrency?.coinDenom === destinationCurrency?.coinDenom
    );
  }, [
    destinationCurrency?.coinDenom,
    isAmountValid,
    isRecipientAddressValid,
    recipientAddressOverride,
    sourceChainSelection.address,
    sourceCurrency?.coinDenom,
  ]);

  return (
    <DepositPageContext.Provider
      value={{
        sourceChainSelection,
        handleSourceChainSelect,
        destinationChainSelection,
        handleDestinationChainSelect,
        sourceCurrency,
        setSourceCurrency: setSourceCurrencyHandler,
        destinationCurrency,
        setDestinationCurrency: setDestinationCurrencyHandler,
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
        sourceChainOptions,
        destinationChainOptions,
        additionalSourceOptions,
        additionalDestinationOptions: additionalAstriaChainOptions,
      }}
    >
      {children}
    </DepositPageContext.Provider>
  );
};
