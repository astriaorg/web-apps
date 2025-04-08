"use client";

import { Decimal } from "@cosmjs/math";
import React, {
  createContext,
  PropsWithChildren,
  useCallback,
  useMemo,
  useState,
} from "react";
import { useConfig } from "wagmi";

import {
  ChainType,
  CosmosChainInfo,
  EvmChainInfo,
  EvmCurrency,
  IbcCurrency,
} from "@repo/flame-types";
import { BaseIcon, EditIcon, PlusIcon } from "@repo/ui/icons";
import { DropdownAdditionalOption } from "components/dropdown";
import { sendIbcTransfer, useCosmosWallet } from "features/cosmos-wallet";
import { createErc20Service, useEvmWallet } from "features/evm-wallet";
import { NotificationType, useNotifications } from "features/notifications";

interface ChainSelection {
  chain: EvmChainInfo | CosmosChainInfo | null;
  currency: EvmCurrency | IbcCurrency | null;
  address: string | null;
}

export interface DepositPageContextProps extends PropsWithChildren {
  sourceChain: ChainSelection;
  destinationChain: ChainSelection;
  handleSourceChainSelect: (chainValue: CosmosChainInfo | EvmChainInfo) => void;
  handleDestinationChainSelect: (chainValue: EvmChainInfo) => void;
  additionalSourceOptions: DropdownAdditionalOption[];
  sourceCurrency: EvmCurrency | IbcCurrency | null;
  setSourceCurrency: (currency: EvmCurrency | IbcCurrency | null) => void;
  destinationCurrency: EvmCurrency | null;
  setDestinationCurrency: (currency: EvmCurrency | null) => void;
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
  handleConnectEvmWallet: () => void;
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

  const [sourceCurrency, setSourceCurrency] = useState<
    EvmCurrency | IbcCurrency | null
  >(null);
  const [destinationCurrency, setDestinationCurrency] =
    useState<EvmCurrency | null>(null);

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

  const handleConnectEvmWallet = useCallback(
    (isSource: boolean = false) => {
      // clear recipient address override when connecting
      // FIXME - is this still what we want to do here?
      setIsRecipientAddressEditable(false);
      setRecipientAddressOverride("");

      // If connecting for source, update source chain
      if (isSource && sourceChain.chain?.chainType === ChainType.EVM) {
        evmWallet.connectToSpecificChain(sourceChain.chain.chainId);
        return;
      }

      // Otherwise connect for destination (Flame)
      connectEvmWallet();
    },
    [connectEvmWallet, sourceChain.chain],
  );

  const handleSourceChainSelect = useCallback(
    (chainValue: CosmosChainInfo | EvmChainInfo) => {
      console.log(
        "Source chain selected:",
        chainValue.chainName,
        chainValue.chainType,
      );
      setSourceChain((prev) => ({
        ...prev,
        chain: chainValue,
        // we'll set address after connection
        address: null,
      }));

      // Handle wallet connection based on chain type
      if (chainValue.chainType === ChainType.COSMOS) {
        // For Cosmos chains, update global context and connect if needed
        cosmosWallet.selectCosmosChain(chainValue as CosmosChainInfo);

        // If we already have a Cosmos address, use it
        if (cosmosWallet.cosmosAccountAddress) {
          setSourceChain((prev) => ({
            ...prev,
            address: cosmosWallet.cosmosAccountAddress,
          }));
        } else {
          // Trigger Cosmos wallet connection
          cosmosWallet.connectCosmosWallet();
        }
      } else if (chainValue.chainType === ChainType.EVM) {
        // For EVM chains (like Base), we need to:
        // 1. Check if we're already connected to this chain
        // 2. If not, prompt for connection to this specific chain

        // Don't update global EVM context for source selection
        // Instead, trigger connection to this specific chain

        // If we have an EVM address and it's for the right chain, use it
        if (
          evmWallet.evmAccountAddress &&
          evmWallet.selectedEvmChain?.chainId === chainValue.chainId
        ) {
          setSourceChain((prev) => ({
            ...prev,
            address: evmWallet.evmAccountAddress,
          }));
        } else {
          // We need to connect to this specific chain
          // This requires enhancing the EVM wallet context to support
          // connecting to a specific chain
          handleConnectEvmWallet(true);
        }
      }
    },
    [
      cosmosWallet,
      evmWallet.evmAccountAddress,
      evmWallet.selectedEvmChain?.chainId,
      handleConnectEvmWallet,
    ],
  );

  const handleDestinationChainSelect = useCallback(
    (chainValue: EvmChainInfo) => {
      console.log(
        "Destination chain selected:",
        chainValue.chainName,
        chainValue.chainType,
      );
      setDestinationChain((prev) => ({
        ...prev,
        chain: chainValue,
      }));

      if (!sourceChain.chain) {
        if (chainValue.chainType === ChainType.ASTRIA) {
          handleConnectEvmWallet();
        }
        return;
      }

      if (sourceChain.chain.chainType === ChainType.COSMOS) {
        // Coming from Cosmos - need to connect EVM wallet for destination
        if (
          chainValue.chainType === ChainType.ASTRIA &&
          !evmWallet.evmAccountAddress
        ) {
          handleConnectEvmWallet();
        }
      } else if (sourceChain.chain.chainType === ChainType.EVM) {
        // Coming from EVM chain (like Base)

        // If user is already connected to an EVM wallet, try to use that address
        if (evmWallet.evmAccountAddress && !isRecipientAddressEditable) {
          setDestinationChain((prev) => ({
            ...prev,
            address: evmWallet.evmAccountAddress,
          }));
        }

        // only update global context if this is Flame chain
        if (chainValue.chainType === ChainType.ASTRIA) {
          evmWallet.selectEvmChain(chainValue);
        }
      }
    },
    [
      evmWallet,
      handleConnectEvmWallet,
      isRecipientAddressEditable,
      sourceChain.chain,
    ],
  );

  // toggle ability to edit recipient address
  const handleEditRecipientClick = useCallback(() => {
    setIsRecipientAddressEditable((prev) => !prev);
  }, []);
  // save the recipient address
  const handleEditRecipientSave = () => {
    setIsRecipientAddressEditable(false);
    // reset wallet states when user manually enters address
    evmWallet.resetState();
  };
  // clear the manually inputted recipient address
  const handleEditRecipientClear = () => {
    setIsRecipientAddressEditable(false);
    setRecipientAddressOverride("");
  };

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

  // dropdown options
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
        label: "Connect Astria Wallet",
        action: handleConnectEvmWallet,
        className: "has-text-primary",
        RightIcon: PlusIcon,
      },
      {
        label: "Enter address manually",
        action: handleEditRecipientClick,
        className: "has-text-primary",
        RightIcon: EditIcon,
      },
    ];
  }, [handleConnectEvmWallet, handleEditRecipientClick]);

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
        setSourceCurrency,
        destinationCurrency,
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
        setRecipientAddressOverride,
        isRecipientAddressEditable,
        setIsRecipientAddressEditable,
        isRecipientAddressValid,
        setIsRecipientAddressValid,
        handleEditRecipientClick,
        handleEditRecipientSave,
        handleEditRecipientClear,
        handleConnectEvmWallet,
        handleDeposit,
        isDepositDisabled,
        cosmosWallet,
        evmWallet,
        additionalSourceOptions,
        additionalAstriaChainOptions,
      }}
    >
      {children}
    </DepositPageContext.Provider>
  );
};
