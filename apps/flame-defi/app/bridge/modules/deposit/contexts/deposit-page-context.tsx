"use client";

import { Decimal } from "@cosmjs/math";
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
  AstriaChain,
  ChainType,
  CosmosChainInfo,
  EvmChainInfo,
  EvmCurrency,
  IbcCurrency,
} from "@repo/flame-types";
import { BaseIcon, EditIcon, PlusIcon } from "@repo/ui/icons";
import { DropdownAdditionalOption, DropdownOption } from "components/dropdown";
import { sendIbcTransfer, useCosmosWallet } from "features/cosmos-wallet";
import { createErc20Service, useEvmWallet } from "features/evm-wallet";
import { NotificationType, useNotifications } from "features/notifications";
import { useBridgeConnections } from "../../../hooks/use-bridge-connections";

interface ChainSelection {
  chain: AstriaChain | EvmChainInfo | CosmosChainInfo | null;
  currency: EvmCurrency | IbcCurrency | null;
  address: string | null;
}

export interface DepositPageContextProps extends PropsWithChildren {
  sourceChain: ChainSelection;
  destinationChain: ChainSelection;
  handleSourceChainSelect: (chainValue: CosmosChainInfo | EvmChainInfo) => void;
  handleDestinationChainSelect: (
    chainValue: CosmosChainInfo | EvmChainInfo,
  ) => void;
  additionalSourceOptions: DropdownAdditionalOption[];
  sourceChainOptions: DropdownOption<CosmosChainInfo | EvmChainInfo>[];
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
  additionalAstriaChainOptions: DropdownAdditionalOption[];
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
    setSourceCurrency: setSourceCurrencyFromHook,
    setDestinationCurrency: setDestinationCurrencyFromHook,
    recipientAddress,
    setRecipientAddress: setRecipientAddressFromHook,
    isManualAddressMode,
    enableManualAddressMode,
    disableManualAddressMode,
    cosmosWallet,
    evmWallet,
  } = bridgeConnections;

  // Map hook connections to our existing interface
  const [sourceChain, setSourceChain] = useState<ChainSelection>({
    chain: null,
    currency: null,
    address: null,
  });

  const [destinationChain, setDestinationChain] = useState<ChainSelection>({
    chain: null,
    currency: null,
    address: null,
  });

  // Keep our local state synced with bridge connections state
  useEffect(() => {
    setSourceChain({
      chain: sourceConnection.chain,
      currency: sourceConnection.currency,
      address: sourceConnection.address,
    });
  }, [sourceConnection]);

  useEffect(() => {
    setDestinationChain({
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
      setRecipientAddressFromHook(value);
    },
    [setRecipientAddressFromHook],
  );

  const setSourceCurrencyHandler = useCallback(
    (currency: EvmCurrency | IbcCurrency | null) => {
      setSourceCurrency(currency);
      setSourceCurrencyFromHook(currency);
    },
    [setSourceCurrencyFromHook],
  );

  const setDestinationCurrencyHandler = useCallback(
    (currency: EvmCurrency | IbcCurrency | null) => {
      setDestinationCurrency(currency);
      setDestinationCurrencyFromHook(currency);
    },
    [setDestinationCurrencyFromHook],
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
    const activeSourceAddress = sourceChain.address;
    const recipientAddress =
      recipientAddressOverride || evmWallet.evmAccountAddress;

    // Common validation
    if (!activeSourceAddress || !recipientAddress) {
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
      // different deposit logic based on source type
      if (sourceChain.chain?.chainType === ChainType.COSMOS) {
        // Cosmos to Astria deposit
        if (
          !cosmosWallet.selectedCosmosChain ||
          !cosmosWallet.selectedIbcCurrency
        ) {
          throw new Error(
            "Please select a Cosmos chain and token to bridge first.",
          );
        }

        const formattedAmount = Decimal.fromUserInput(
          amount,
          cosmosWallet.selectedIbcCurrency.coinDecimals,
        ).atomics;

        const signer = await cosmosWallet.getCosmosSigningClient();
        await sendIbcTransfer(
          signer,
          cosmosWallet.cosmosAccountAddress!,
          recipientAddress,
          formattedAmount,
          cosmosWallet.selectedIbcCurrency,
        );
      } else if (sourceChain.chain?.chainType === ChainType.EVM) {
        // evm to Astria deposit using intent bridge
        if (!sourceChain.chain || !sourceCurrency) {
          throw new Error(
            "Please select a Coinbase chain and token to bridge first.",
          );
        }

        if (
          !("astriaIntentBridgeAddress" in sourceCurrency) ||
          !sourceCurrency.astriaIntentBridgeAddress
        ) {
          throw new Error(
            "Intent bridge contract not configured for this token.",
          );
        }

        // Convert amount to the proper format based on decimals
        // FIXME - is this how the math is done in other places?
        const formattedAmount = BigInt(
          Math.floor(
            parseFloat(amount) * 10 ** sourceCurrency.coinDecimals,
          ).toString(),
        );

        // send money via ERC20 contract
        if (sourceCurrency.erc20ContractAddress) {
          const erc20Service = createErc20Service(
            wagmiConfig,
            sourceCurrency.erc20ContractAddress,
          );
          // FIXME - need to call the astriaIntentBridge contract
          await erc20Service.transfer({
            recipient: sourceCurrency.astriaIntentBridgeAddress,
            amount: formattedAmount,
            chainId: sourceChain.chain.chainId,
          });
        }
      } else {
        throw new Error("Unsupported source type for deposit");
      }

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
      sourceChain.address &&
      sourceCurrency?.coinDenom === destinationCurrency?.coinDenom
    );
  }, [
    destinationCurrency?.coinDenom,
    isAmountValid,
    isRecipientAddressValid,
    recipientAddressOverride,
    sourceChain.address,
    sourceCurrency?.coinDenom,
  ]);

  return (
    <DepositPageContext.Provider
      value={{
        sourceChain,
        handleSourceChainSelect,
        destinationChain,
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
        additionalAstriaChainOptions,
      }}
    >
      {children}
    </DepositPageContext.Provider>
  );
};
