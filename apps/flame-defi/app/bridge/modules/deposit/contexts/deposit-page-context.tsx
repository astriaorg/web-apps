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

import { CoinbaseChain, CosmosChainInfo } from "@repo/flame-types";
import { BaseIcon, EditIcon, PlusIcon } from "@repo/ui/icons";
import { SourceType } from "bridge/types";
import { DropdownAdditionalOption } from "components/dropdown";
import { useCoinbaseWallet } from "features/coinbase-wallet";
import { sendIbcTransfer, useCosmosWallet } from "features/cosmos-wallet";
import { createErc20Service, useEvmWallet } from "features/evm-wallet";
import { NotificationType, useNotifications } from "features/notifications";

export interface DepositPageContextProps extends PropsWithChildren {
  selectedSourceType: SourceType;
  setSelectedSourceType: (value: SourceType) => void;
  additionalSourceOptions: DropdownAdditionalOption[];
  handleSourceChainSelect: (
    chainValue: CosmosChainInfo | CoinbaseChain,
  ) => void;
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
  getActiveSourceAddress: () => string | null;
  additionalAstriaChainOptions: DropdownAdditionalOption[];
  cosmosWallet: ReturnType<typeof useCosmosWallet>;
  evmWallet: ReturnType<typeof useEvmWallet>;
  coinbaseWallet: ReturnType<typeof useCoinbaseWallet>;
}

export const DepositPageContext = createContext<
  DepositPageContextProps | undefined
>(undefined);

export const DepositPageContextProvider = ({ children }: PropsWithChildren) => {
  const { addNotification } = useNotifications();
  const wagmiConfig = useConfig();

  const [selectedSourceType, setSelectedSourceType] = useState<SourceType>(
    SourceType.Cosmos,
  );

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
  // FIXME - each chain type having its own `foo-wallet-context` doesn't feel great.
  //  is there a cleaner way to manage different possible wallet connections depending on source and dest chains?
  const cosmosWallet = useCosmosWallet();
  const evmWallet = useEvmWallet();
  const { connectEvmWallet } = evmWallet;
  const coinbaseWallet = useCoinbaseWallet();

  // sets selected chain in parent wallet contexts.
  const handleSourceChainSelect = (
    chainValue: CosmosChainInfo | CoinbaseChain,
  ) => {
    const cosmosChain = cosmosWallet.cosmosChainsOptions.find(
      (option) => option.value === chainValue,
    );
    if (cosmosChain) {
      setSelectedSourceType(SourceType.Cosmos);
      cosmosWallet.selectCosmosChain(chainValue as CosmosChainInfo);
      return;
    }

    const coinbaseChain = coinbaseWallet.coinbaseChainsOptions.find(
      (option) => option.value === chainValue,
    );
    if (coinbaseChain) {
      setSelectedSourceType(SourceType.Coinbase);
      coinbaseWallet.selectCoinbaseChain(chainValue as CoinbaseChain);
      return;
    }
  };

  // toggle ability to edit recipient address
  const handleEditRecipientClick = useCallback(() => {
    console.log("handleEditRecipientClick");
    setIsRecipientAddressEditable((prev) => !prev);
  }, []);
  // save the recipient address
  const handleEditRecipientSave = () => {
    console.log("handleEditRecipientSave");
    setIsRecipientAddressEditable(false);
    // reset wallet states when user manually enters address
    evmWallet.resetState();
  };
  // clear the manually inputted recipient address
  const handleEditRecipientClear = () => {
    console.log("handleEditRecipientClear");
    setIsRecipientAddressEditable(false);
    setRecipientAddressOverride("");
  };

  // get the current source address based on the selected source type
  const getActiveSourceAddress = useCallback((): string | null => {
    switch (selectedSourceType) {
      case SourceType.Cosmos:
        return cosmosWallet.cosmosAccountAddress;
      case SourceType.Coinbase:
        return coinbaseWallet.coinbaseAccountAddress;
      default:
        return null;
    }
  }, [
    selectedSourceType,
    cosmosWallet.cosmosAccountAddress,
    coinbaseWallet.coinbaseAccountAddress,
  ]);

  // handle connecting to EVM wallet
  const handleConnectEvmWallet = useCallback(() => {
    // clear recipient address override values when user attempts to connect evm wallet
    setIsRecipientAddressEditable(false);
    setRecipientAddressOverride("");
    connectEvmWallet();
  }, [connectEvmWallet]);

  const handleDeposit = async () => {
    const activeSourceAddress = getActiveSourceAddress();
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
      if (selectedSourceType === SourceType.Cosmos) {
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
      } else if (selectedSourceType === SourceType.Coinbase) {
        // Coinbase to Astria deposit using intent bridge
        if (
          !coinbaseWallet.selectedCoinbaseChain ||
          !coinbaseWallet.selectedCoinbaseCurrency
        ) {
          throw new Error(
            "Please select a Coinbase chain and token to bridge first.",
          );
        }

        if (
          !coinbaseWallet.selectedCoinbaseCurrency.astriaIntentBridgeAddress
        ) {
          throw new Error(
            "Intent bridge contract not configured for this token.",
          );
        }

        // Convert amount to the proper format based on decimals
        // FIXME - is this how the math is done in other places?
        const formattedAmount = BigInt(
          Math.floor(
            parseFloat(amount) *
              10 ** coinbaseWallet.selectedCoinbaseCurrency.coinDecimals,
          ).toString(),
        );

        // send money via ERC20 contract
        if (coinbaseWallet.selectedCoinbaseCurrency.erc20ContractAddress) {
          const erc20Service = createErc20Service(
            wagmiConfig,
            coinbaseWallet.selectedCoinbaseCurrency.erc20ContractAddress,
          );
          // NOTE - right now will be sent to same address on the destination chain
          await erc20Service.transfer({
            recipient:
              coinbaseWallet.selectedCoinbaseCurrency.astriaIntentBridgeAddress,
            amount: formattedAmount,
            chainId: coinbaseWallet.selectedCoinbaseChain.chainId,
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
    const activeSourceAddress = getActiveSourceAddress();

    if (recipientAddressOverride) {
      return !(isAmountValid && isRecipientAddressValid && activeSourceAddress);
    }

    if (selectedSourceType === SourceType.Cosmos) {
      return !(
        evmWallet.evmAccountAddress &&
        isAmountValid &&
        isRecipientAddressValid &&
        cosmosWallet.cosmosAccountAddress &&
        cosmosWallet.selectedIbcCurrency?.coinDenom ===
          evmWallet.selectedEvmCurrency?.coinDenom
      );
    }

    if (selectedSourceType === SourceType.Coinbase) {
      return !(
        evmWallet.evmAccountAddress &&
        isAmountValid &&
        isRecipientAddressValid &&
        coinbaseWallet.coinbaseAccountAddress &&
        coinbaseWallet.selectedCoinbaseCurrency !== null
      );
    }

    return true;
  }, [
    getActiveSourceAddress,
    recipientAddressOverride,
    evmWallet.evmAccountAddress,
    evmWallet.selectedEvmCurrency,
    isAmountValid,
    isRecipientAddressValid,
    cosmosWallet.cosmosAccountAddress,
    cosmosWallet.selectedIbcCurrency,
    coinbaseWallet.coinbaseAccountAddress,
    coinbaseWallet.selectedCoinbaseCurrency,
    selectedSourceType,
  ]);

  return (
    <DepositPageContext.Provider
      value={{
        selectedSourceType,
        setSelectedSourceType,
        handleSourceChainSelect,
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
        getActiveSourceAddress,
        cosmosWallet,
        evmWallet,
        coinbaseWallet,
        additionalSourceOptions,
        additionalAstriaChainOptions,
      }}
    >
      {children}
    </DepositPageContext.Provider>
  );
};
