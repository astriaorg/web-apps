"use client";

import { AnimatedArrowSpacer, Button } from "@repo/ui/components";
import { ArrowUpDownIcon, WalletIcon } from "@repo/ui/icons";
import { formatDecimalValues, shortenAddress } from "@repo/ui/utils";
import { Dropdown } from "components/dropdown";
import { useCosmosWallet } from "features/cosmos-wallet";
import {
  AddErc20ToWalletButton,
  createWithdrawerService,
  useEvmWallet,
} from "features/evm-wallet";
import { NotificationType, useNotifications } from "features/notifications";
import type React from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useConfig as useWagmiConfig } from "wagmi";

export default function WithdrawCard(): React.ReactElement {
  const wagmiConfig = useWagmiConfig();
  const { addNotification } = useNotifications();

  const {
    evmAccountAddress: fromAddress,
    selectEvmChain,
    evmChainsOptions,
    selectedEvmChain,
    selectedEvmChainOption,
    ibcWithdrawFeeDisplay,
    defaultEvmCurrencyOption,
    selectEvmCurrency,
    evmCurrencyOptions,
    selectedEvmCurrency,
    selectedEvmCurrencyBalance,
    isLoadingSelectedEvmCurrencyBalance,
    connectEvmWallet,
  } = useEvmWallet();

  const {
    cosmosAccountAddress,
    selectCosmosChain,
    cosmosChainsOptions,
    selectedCosmosChain,
    selectedCosmosChainOption,
    defaultIbcCurrencyOption,
    selectIbcCurrency,
    ibcCurrencyOptions,
    cosmosBalance,
    isLoadingCosmosBalance,
    resetState: resetIbcWalletState,
    connectCosmosWallet,
  } = useCosmosWallet();

  // the ibc currency selection is controlled by the sender's chosen evm currency,
  // and should be updated when an ibc currency or ibc chain is selected
  const selectedIbcCurrencyOption = useMemo(() => {
    if (!selectedEvmCurrency) {
      return defaultIbcCurrencyOption;
    }
    const matchingIbcCurrency = selectedCosmosChain?.currencies.find(
      (currency) => currency.coinDenom === selectedEvmCurrency.coinDenom,
    );
    if (!matchingIbcCurrency) {
      return null;
    }
    return {
      label: matchingIbcCurrency.coinDenom,
      value: matchingIbcCurrency,
      LeftIcon: matchingIbcCurrency.IconComponent,
    };
  }, [selectedEvmCurrency, selectedCosmosChain, defaultIbcCurrencyOption]);

  const [amount, setAmount] = useState<string>("");
  const [isAmountValid, setIsAmountValid] = useState<boolean>(false);

  const [isRecipientAddressValid, setIsRecipientAddressValid] =
    useState<boolean>(false);
  const [hasTouchedForm, setHasTouchedForm] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const formattedEvmBalanceValue = formatDecimalValues(
    selectedEvmCurrencyBalance?.value,
  );
  const formattedCosmosBalanceValue = formatDecimalValues(cosmosBalance?.value);
  // recipientAddressOverride is used to allow manual entry of an address
  const [recipientAddressOverride, setRecipientAddressOverride] =
    useState<string>("");
  const [isRecipientAddressEditable, setIsRecipientAddressEditable] =
    useState<boolean>(false);
  const handleEditRecipientClick = useCallback(() => {
    setIsRecipientAddressEditable(!isRecipientAddressEditable);
  }, [isRecipientAddressEditable]);
  const handleEditRecipientSave = () => {
    setIsRecipientAddressEditable(false);
    // reset ibcWalletState when user manually enters address
    resetIbcWalletState();
  };
  const handleEditRecipientClear = () => {
    setIsRecipientAddressEditable(false);
    setRecipientAddressOverride("");
  };
  const updateRecipientAddressOverride = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setRecipientAddressOverride(event.target.value);
  };

  useEffect(() => {
    if (amount || cosmosAccountAddress || recipientAddressOverride) {
      setHasTouchedForm(true);
    }
    const recipientAddress =
      recipientAddressOverride || cosmosAccountAddress || null;
    checkIsFormValid(recipientAddress, amount);
  }, [amount, cosmosAccountAddress, recipientAddressOverride]);

  const updateAmount = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(event.target.value);
  };

  const checkIsFormValid = (
    recipientAddressInput: string | null,
    amountInput: string,
  ) => {
    if (recipientAddressInput === null) {
      setIsRecipientAddressValid(false);
      return;
    }
    const amount = Number.parseFloat(amountInput);
    const amountValid = amount > 0;
    setIsAmountValid(amountValid);
    const isRecipientAddressValid = recipientAddressInput.length > 0;
    setIsRecipientAddressValid(isRecipientAddressValid);
  };

  const handleConnectCosmosWallet = useCallback(() => {
    setIsRecipientAddressEditable(false);
    setRecipientAddressOverride("");
    connectCosmosWallet();
  }, [connectCosmosWallet]);

  // ensure evm wallet connection when selected EVM chain changes
  useEffect(() => {
    if (!selectedEvmChain) {
      return;
    }
    connectEvmWallet();
  }, [connectEvmWallet, selectedEvmChain]);

  // ensure cosmos wallet connection when selected ibc chain changes
  useEffect(() => {
    if (!selectedCosmosChain) {
      return;
    }
    handleConnectCosmosWallet();
  }, [selectedCosmosChain, handleConnectCosmosWallet]);

  const handleWithdraw = async () => {
    if (!selectedEvmChain || !selectedEvmCurrency) {
      addNotification({
        toastOpts: {
          toastType: NotificationType.WARNING,
          message: "Please select a chain and token to bridge first.",
          onAcknowledge: () => {},
        },
      });
      return;
    }

    const recipientAddress = recipientAddressOverride || cosmosAccountAddress;
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
      !selectedEvmCurrency.nativeTokenWithdrawerContractAddress &&
      !selectedEvmCurrency.erc20ContractAddress
    ) {
      console.error("Withdrawal cannot proceed: missing contract address");
      // shouldn't really fall into this case
      return;
    }

    setIsLoading(true);
    setIsAnimating(true);
    try {
      const contractAddress = selectedEvmCurrency.isNative
        ? selectedEvmCurrency.nativeTokenWithdrawerContractAddress
        : selectedEvmCurrency.erc20ContractAddress;
      if (!contractAddress) {
        throw new Error("No contract address found");
      }
      if (!selectedEvmCurrency.ibcWithdrawalFeeWei) {
        // NOTE - we started with only cosmos chains so they were all ibc withdrawals previously,
        //  but we will be supporting Base withdrawals soon probably
        throw new Error("Base withdrawals coming soon but not yet supported.")
      }
      const withdrawerSvc = createWithdrawerService(
        wagmiConfig,
        contractAddress,
        !selectedEvmCurrency.isNative,
      );
      await withdrawerSvc.withdrawToIbcChain(
        selectedEvmChain.chainId,
        recipientAddress,
        amount,
        selectedEvmCurrency.coinDecimals,
        selectedEvmCurrency.ibcWithdrawalFeeWei,
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

  // disable withdraw button if form is invalid
  const isWithdrawDisabled = useMemo<boolean>((): boolean => {
    if (recipientAddressOverride) {
      // there won't be a selected ibc chain and currency if user manually
      // enters a recipient address
      return !(isAmountValid && isRecipientAddressValid && fromAddress);
    }
    return !(
      cosmosAccountAddress &&
      isAmountValid &&
      isRecipientAddressValid &&
      fromAddress &&
      selectedEvmCurrency?.coinDenom ===
        selectedIbcCurrencyOption?.value?.coinDenom
    );
  }, [
    recipientAddressOverride,
    cosmosAccountAddress,
    isAmountValid,
    isRecipientAddressValid,
    fromAddress,
    selectedEvmCurrency,
    selectedIbcCurrencyOption,
  ]);

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
        action: connectEvmWallet,
        className: "has-text-primary",
        rightIconClass: "fas fa-plus",
      },
    ];
  }, [connectEvmWallet]);

  return (
    <div>
      <div className="mb-4">
        <div className="flex flex-col">
          <div className="mb-2 sm:hidden">From</div>
          <div className="flex flex-col sm:flex-row sm:items-center">
            <div className="hidden sm:block sm:mr-4 sm:min-w-[60px]">From</div>
            <div className="flex flex-col sm:flex-row w-full gap-3">
              <div className="grow">
                <Dropdown
                  placeholder="Connect EVM Wallet"
                  options={evmChainsOptions}
                  onSelect={selectEvmChain}
                  LeftIcon={WalletIcon}
                  additionalOptions={additionalEvmOptions}
                  valueOverride={selectedEvmChainOption}
                />
              </div>
              {selectedEvmChain && evmCurrencyOptions && (
                <div className="w-full sm:w-auto">
                  <Dropdown
                    placeholder="Select a token"
                    options={evmCurrencyOptions}
                    defaultOption={defaultEvmCurrencyOption}
                    onSelect={selectEvmCurrency}
                  />
                </div>
              )}
            </div>
          </div>
          {fromAddress && (
            <div className="mt-4 rounded-xl p-4 transition border border-solid border-transparent bg-semi-white hover:border-grey-medium">
              {fromAddress && (
                <p className="text-grey-light font-semibold">
                  Address: {shortenAddress(fromAddress)}
                </p>
              )}
              {fromAddress &&
                selectedEvmCurrency &&
                !isLoadingSelectedEvmCurrencyBalance && (
                  <p className="mt-2 text-grey-lighter font-semibold">
                    Balance: {formattedEvmBalanceValue}{" "}
                    {selectedEvmCurrencyBalance?.symbol}
                  </p>
                )}
              {fromAddress && isLoadingSelectedEvmCurrencyBalance && (
                <p className="mt-2 text-grey-lighter font-semibold">
                  Balance: <i className="fas fa-spinner fa-pulse" />
                </p>
              )}
              {selectedEvmCurrency?.erc20ContractAddress && fromAddress && (
                <div className="mt-3">
                  <AddErc20ToWalletButton evmCurrency={selectedEvmCurrency} />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {isAnimating ? (
        <AnimatedArrowSpacer isAnimating={isAnimating} />
      ) : (
        <div className="flex flex-row justify-center sm:justify-start mt-4 sm:my-4">
          <div>
            <ArrowUpDownIcon size={32} />
          </div>
          <div className="hidden sm:block ml-4 border-t border-grey-dark my-4 w-full" />
        </div>
      )}

      <div className="mb-4">
        <div className="flex flex-col">
          <div className="mb-2 sm:hidden">To</div>
          <div className="flex flex-col sm:flex-row sm:items-center">
            <div className="hidden sm:block sm:mr-4 sm:min-w-[60px]">To</div>
            <div className="flex flex-col sm:flex-row w-full gap-3">
              <div className="grow">
                <Dropdown
                  placeholder="Connect Keplr Wallet or enter address"
                  options={cosmosChainsOptions}
                  onSelect={selectCosmosChain}
                  LeftIcon={WalletIcon}
                  additionalOptions={additionalIbcOptions}
                  valueOverride={selectedCosmosChainOption}
                />
              </div>
              {selectedCosmosChain && ibcCurrencyOptions && (
                <div className="w-full sm:w-auto">
                  <Dropdown
                    placeholder="No matching token"
                    options={ibcCurrencyOptions}
                    defaultOption={defaultIbcCurrencyOption}
                    onSelect={selectIbcCurrency}
                    valueOverride={selectedIbcCurrencyOption}
                    disabled={true}
                  />
                </div>
              )}
            </div>
          </div>

          {cosmosAccountAddress &&
            !isRecipientAddressEditable &&
            !recipientAddressOverride && (
              <div className="mt-3 py-2 px-3 rounded-xl bg-grey-dark">
                {cosmosAccountAddress && (
                  <p
                    className="text-grey-light font-semibold cursor-pointer"
                    onClick={handleEditRecipientClick}
                    onKeyDown={handleEditRecipientClick}
                  >
                    <span className="mr-2">
                      Address: {shortenAddress(cosmosAccountAddress)}
                    </span>
                    <i className="fas fa-pen-to-square" />
                  </p>
                )}
                {cosmosAccountAddress && !isLoadingCosmosBalance && (
                  <p className="mt-2 text-grey-lighter font-semibold">
                    Balance: {formattedCosmosBalanceValue}{" "}
                    {cosmosBalance?.symbol}
                  </p>
                )}
                {cosmosAccountAddress && isLoadingCosmosBalance && (
                  <p className="mt-2 text-grey-lighter font-semibold">
                    Balance: <i className="fas fa-spinner fa-pulse" />
                  </p>
                )}
                {ibcWithdrawFeeDisplay && (
                  <div className="mt-2 text-grey-light text-sm">
                    Withdrawal fee: {ibcWithdrawFeeDisplay}
                  </div>
                )}
              </div>
            )}

          {recipientAddressOverride && !isRecipientAddressEditable && (
            <div className="mt-3 py-2 px-3 rounded-xl bg-grey-dark">
              <p
                className="text-grey-light font-semibold cursor-pointer"
                onClick={handleEditRecipientClick}
                onKeyDown={handleEditRecipientClick}
              >
                <span className="mr-2">
                  Address: {recipientAddressOverride}
                </span>
                <i className="fas fa-pen-to-square" />
              </p>
              {!isRecipientAddressValid && hasTouchedForm && (
                <div className="mt-2 text-red-500 text-sm">
                  Recipient address must be a valid address
                </div>
              )}
              <p className="mt-2 text-grey-lighter font-semibold text-xs">
                Connect via wallet to show balance
              </p>
            </div>
          )}

          {isRecipientAddressEditable && (
            <div className="mt-3 py-2 px-3 rounded-xl bg-grey-dark">
              <div className="text-grey-light font-semibold">
                <input
                  className="w-full p-2 bg-transparent border border-white rounded-sm text-white"
                  type="text"
                  placeholder="Enter address"
                  onChange={updateRecipientAddressOverride}
                  value={recipientAddressOverride}
                />
                <button
                  type="button"
                  className="mr-2 mt-2 text-white hover:opacity-75"
                  onClick={handleEditRecipientSave}
                >
                  Save
                </button>
                <button
                  type="button"
                  className="mt-2 text-white hover:opacity-75"
                  onClick={handleEditRecipientClear}
                >
                  Clear
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center">
        <div className="w-full border-t border-grey-dark my-4" />
      </div>

      <div className="mb-4">
        <div className="flex flex-col">
          <div className="mb-2 sm:hidden">Amount</div>
          <div className="flex flex-col sm:flex-row sm:items-center">
            <div className="hidden sm:block sm:mr-4 sm:min-w-[60px]">
              Amount
            </div>
            <div className="grow">
              <input
                className="w-full p-3 bg-transparent border border-grey-dark focus:border-white focus:outline-hidden rounded-xl text-white text-[20px]"
                type="text"
                placeholder="0.00"
                onChange={updateAmount}
                value={amount}
              />
            </div>
          </div>
          {!isAmountValid && hasTouchedForm && (
            <div className="mt-2 text-red-500 text-sm">
              Amount must be a number greater than 0
            </div>
          )}
        </div>
      </div>

      <div className="mt-4">
        <Button
          variant="gradient"
          onClick={handleWithdraw}
          disabled={isWithdrawDisabled}
        >
          {isLoading ? "Processing..." : "Withdraw"}
        </Button>
      </div>
    </div>
  );
}
