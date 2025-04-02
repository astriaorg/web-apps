"use client";

import {
  createContext,
  type FC,
  PropsWithChildren,
  useCallback,
  useMemo,
  useState,
} from "react";
import { SourceType } from "bridge/types";
import { CoinbaseChain, CosmosChainInfo } from "@repo/flame-types";
import { useCosmosWallet } from "features/cosmos-wallet";
import { useEvmWallet } from "features/evm-wallet";
import { useCoinbaseWallet } from "features/coinbase-wallet";
import { BaseIcon, EditIcon, PlusIcon } from "@repo/ui/icons";

export interface DepositPageContextProps extends PropsWithChildren {
  selectedSourceType: SourceType;
  setSelectedSourceType: (value: SourceType) => void;
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
  setIsRecipientAddressValid: (value: boolean) => void;
  handleEditRecipientClick: () => void;
  handleEditRecipientSave: () => void;
  handleEditRecipientClear: () => void;
  handleConnectEvmWallet: () => void;
  handleDeposit: () => Promise<void>;
  isDepositDisabled: boolean;
  getActiveSourceAddress: () => string | null;
  cosmosWallet: ReturnType<typeof useCosmosWallet>;
  evmWallet: ReturnType<typeof useEvmWallet>;
  coinbaseWallet: ReturnType<typeof useCoinbaseWallet>;
  additionalSourceOptions: Array<{
    label: string;
    action: () => void;
    className: string;
    LeftIcon?: FC<{ className?: string; size?: number }>;
    RightIcon?: FC<{ className?: string; size?: number }>;
  }>;
  additionalEvmChainOptions: Array<{
    label: string;
    action: () => void;
    className: string;
    LeftIcon?: FC<{ className?: string; size?: number }>;
    RightIcon?: FC<{ className?: string; size?: number }>;
  }>;
}

export const DepositPageContext = createContext<
  DepositPageContextProps | undefined
>(undefined);

export const DepositPageContextProvider = ({ children }: PropsWithChildren) => {
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
    console.log("handleConnectEvmWallet");
    // clear recipient address override values when user attempts to connect evm wallet
    setIsRecipientAddressEditable(false);
    setRecipientAddressOverride("");
    connectEvmWallet();
  }, [connectEvmWallet]);

  const handleDeposit = async () => {
    const activeSourceAddress = getActiveSourceAddress();
    const recipientAddress =
      recipientAddressOverride || evmWallet.evmAccountAddress;

    // Implementation kept in content-section.tsx for now
    // This is a stub that will be completed in the content section
    console.log("Handle deposit action", {
      activeSourceAddress,
      recipientAddress,
      selectedSourceType,
      amount,
    });
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

  const additionalEvmChainOptions = useMemo(() => {
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
        additionalEvmChainOptions,
      }}
    >
      {children}
    </DepositPageContext.Provider>
  );
};
