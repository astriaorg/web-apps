"use client";

import React, { useMemo, useEffect, useCallback } from "react";
import { useConfig } from "wagmi";

import { AnimatedArrowSpacer, Button } from "@repo/ui/components";
import { ArrowUpDownIcon, WalletIcon } from "@repo/ui/icons";
import { formatDecimalValues, shortenAddress } from "@repo/ui/utils";
import { Dropdown } from "components/dropdown";
import {
  AddErc20ToWalletButton,
  createWithdrawerService,
} from "features/evm-wallet";
import { NotificationType, useNotifications } from "features/notifications";
import { useWithdrawPageContext } from "../hooks/use-withdraw-page-context";

export const ContentSection = () => {
  const { addNotification } = useNotifications();
  const wagmiConfig = useConfig();

  const {
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
    isRecipientAddressEditable,
    handleEditRecipientClick,
    handleEditRecipientSave,
    handleEditRecipientClear,
    isRecipientAddressValid,
    setIsRecipientAddressValid,
    setRecipientAddressOverride,
    handleConnectCosmosWallet,
    isWithdrawDisabled,
    additionalCosmosOptions,
    additionalEvmOptions,
    cosmosWallet,
    evmWallet,
  } = useWithdrawPageContext();

  // ensure evm wallet connection when selected EVM chain changes
  useEffect(() => {
    if (!evmWallet.selectedEvmChain) {
      return;
    }
    evmWallet.connectEvmWallet();
  }, [evmWallet.selectedEvmChain, evmWallet]);

  // ensure cosmos wallet connection when selected cosmos chain changes
  useEffect(() => {
    if (!cosmosWallet.selectedCosmosChain) {
      return;
    }
    handleConnectCosmosWallet();
  }, [cosmosWallet.selectedCosmosChain, handleConnectCosmosWallet]);

  // the cosmos currency selection is controlled by the sender's chosen evm currency,
  // and should be updated when an evm currency or cosmos chain is selected
  const selectedCosmosCurrencyOption = useMemo(() => {
    if (!evmWallet.selectedEvmCurrency) {
      return cosmosWallet.defaultIbcCurrencyOption;
    }
    const matchingCosmosCurrency =
      cosmosWallet.selectedCosmosChain?.currencies.find(
        (currency) =>
          currency.coinDenom === evmWallet.selectedEvmCurrency?.coinDenom,
      );
    if (!matchingCosmosCurrency) {
      return null;
    }
    return {
      label: matchingCosmosCurrency.coinDenom,
      value: matchingCosmosCurrency,
      LeftIcon: matchingCosmosCurrency.IconComponent,
    };
  }, [
    evmWallet.selectedEvmCurrency,
    cosmosWallet.selectedCosmosChain,
    cosmosWallet.defaultIbcCurrencyOption,
  ]);

  const updateAmount = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(event.target.value);
  };

  const checkIsFormValid = useCallback(
    (recipientAddressInput: string | null, amountInput: string) => {
      if (recipientAddressInput === null) {
        setIsRecipientAddressValid(false);
        return;
      }
      const amount = Number.parseFloat(amountInput);
      const amountValid = amount > 0;
      setIsAmountValid(amountValid);
      const isRecipientAddressValid = recipientAddressInput.length > 0;
      setIsRecipientAddressValid(isRecipientAddressValid);
    },
    [setIsAmountValid, setIsRecipientAddressValid],
  );

  // check if form is valid whenever values change
  useEffect(() => {
    if (
      amount ||
      cosmosWallet.cosmosAccountAddress ||
      recipientAddressOverride
    ) {
      setHasTouchedForm(true);
    }
    const recipientAddress =
      recipientAddressOverride || cosmosWallet.cosmosAccountAddress;
    checkIsFormValid(recipientAddress, amount);
  }, [
    amount,
    checkIsFormValid,
    cosmosWallet.cosmosAccountAddress,
    recipientAddressOverride,
    setHasTouchedForm,
  ]);

  const updateRecipientAddressOverride = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setRecipientAddressOverride(event.target.value);
  };

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

  const formattedEvmBalanceValue = formatDecimalValues(
    evmWallet.selectedEvmCurrencyBalance?.value,
  );
  const formattedCosmosBalanceValue = formatDecimalValues(
    cosmosWallet.cosmosBalance?.value,
  );

  return (
    <div className="w-full min-h-[calc(100vh-85px-96px)] flex flex-col items-center">
      <div className="w-full px-0 md:w-[675px] lg:px-4">
        <div className="px-4 py-12 sm:px-4 lg:p-12 bg-[radial-gradient(144.23%_141.13%_at_50.15%_0%,#221F1F_0%,#050A0D_100%)] shadow-[inset_1px_1px_1px_-1px_rgba(255,255,255,0.5)] rounded-2xl">
          <div className="mb-4">
            <div className="flex flex-col">
              <div className="mb-2 sm:hidden">From</div>
              <div className="flex flex-col sm:flex-row sm:items-center">
                <div className="hidden sm:block sm:mr-4 sm:min-w-[60px]">
                  From
                </div>
                <div className="flex flex-col sm:flex-row w-full gap-3">
                  <div className="grow">
                    <Dropdown
                      placeholder="Connect EVM Wallet"
                      options={evmWallet.evmChainsOptions}
                      onSelect={evmWallet.selectEvmChain}
                      LeftIcon={WalletIcon}
                      additionalOptions={additionalEvmOptions}
                      valueOverride={evmWallet.selectedEvmChainOption}
                    />
                  </div>
                  {evmWallet.selectedEvmChain &&
                    evmWallet.evmCurrencyOptions && (
                      <div className="w-full sm:w-auto">
                        <Dropdown
                          placeholder="Select a token"
                          options={evmWallet.evmCurrencyOptions}
                          defaultOption={evmWallet.defaultEvmCurrencyOption}
                          onSelect={evmWallet.selectEvmCurrency}
                        />
                      </div>
                    )}
                </div>
              </div>
              {evmWallet.evmAccountAddress && (
                <div className="mt-4 rounded-xl p-4 transition border border-solid border-transparent bg-semi-white hover:border-grey-medium">
                  {evmWallet.evmAccountAddress && (
                    <p className="text-grey-light font-semibold">
                      Address: {shortenAddress(evmWallet.evmAccountAddress)}
                    </p>
                  )}
                  {evmWallet.evmAccountAddress &&
                    evmWallet.selectedEvmCurrency &&
                    !evmWallet.isLoadingSelectedEvmCurrencyBalance && (
                      <p className="mt-2 text-grey-lighter font-semibold">
                        Balance: {formattedEvmBalanceValue}{" "}
                        {evmWallet.selectedEvmCurrencyBalance?.symbol}
                      </p>
                    )}
                  {evmWallet.evmAccountAddress &&
                    evmWallet.isLoadingSelectedEvmCurrencyBalance && (
                      <p className="mt-2 text-grey-lighter font-semibold">
                        Balance: <i className="fas fa-spinner fa-pulse" />
                      </p>
                    )}
                  {evmWallet.selectedEvmCurrency?.erc20ContractAddress &&
                    evmWallet.evmAccountAddress && (
                      <div className="mt-3">
                        <AddErc20ToWalletButton
                          evmCurrency={evmWallet.selectedEvmCurrency}
                        />
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
                <div className="hidden sm:block sm:mr-4 sm:min-w-[60px]">
                  To
                </div>
                <div className="flex flex-col sm:flex-row w-full gap-3">
                  <div className="grow">
                    <Dropdown
                      placeholder="Connect Keplr Wallet or enter address"
                      options={cosmosWallet.cosmosChainsOptions}
                      onSelect={cosmosWallet.selectCosmosChain}
                      LeftIcon={WalletIcon}
                      additionalOptions={additionalCosmosOptions}
                      valueOverride={cosmosWallet.selectedCosmosChainOption}
                    />
                  </div>
                  {cosmosWallet.selectedCosmosChain &&
                    cosmosWallet.ibcCurrencyOptions && (
                      <div className="w-full sm:w-auto">
                        <Dropdown
                          placeholder="No matching token"
                          options={cosmosWallet.ibcCurrencyOptions}
                          defaultOption={cosmosWallet.defaultIbcCurrencyOption}
                          onSelect={cosmosWallet.selectIbcCurrency}
                          valueOverride={selectedCosmosCurrencyOption}
                          disabled={true}
                        />
                      </div>
                    )}
                </div>
              </div>

              {cosmosWallet.cosmosAccountAddress &&
                !isRecipientAddressEditable &&
                !recipientAddressOverride && (
                  <div className="mt-3 bg-grey-dark rounded-xl py-2 px-3">
                    {cosmosWallet.cosmosAccountAddress && (
                      <p
                        className="text-grey-light font-semibold cursor-pointer"
                        onClick={handleEditRecipientClick}
                        onKeyDown={handleEditRecipientClick}
                      >
                        <span className="mr-2">
                          Address:{" "}
                          {shortenAddress(cosmosWallet.cosmosAccountAddress)}
                        </span>
                        <i className="fas fa-pen-to-square" />
                      </p>
                    )}
                    {cosmosWallet.cosmosAccountAddress &&
                      !cosmosWallet.isLoadingCosmosBalance && (
                        <p className="mt-2 text-grey-lighter font-semibold">
                          Balance: {formattedCosmosBalanceValue}{" "}
                          {cosmosWallet.cosmosBalance?.symbol}
                        </p>
                      )}
                    {cosmosWallet.cosmosAccountAddress &&
                      cosmosWallet.isLoadingCosmosBalance && (
                        <p className="mt-2 text-grey-lighter font-semibold">
                          Balance: <i className="fas fa-spinner fa-pulse" />
                        </p>
                      )}
                    {evmWallet.ibcWithdrawFeeDisplay && (
                      <div className="mt-2 text-grey-light text-sm">
                        Withdrawal fee: {evmWallet.ibcWithdrawFeeDisplay}
                      </div>
                    )}
                  </div>
                )}

              {recipientAddressOverride && !isRecipientAddressEditable && (
                <div className="mt-3 bg-grey-dark rounded-xl py-2 px-3">
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
                    <div className="mt-2 text-status-danger text-sm">
                      Recipient address must be a valid address
                    </div>
                  )}
                  <p className="mt-2 text-grey-lighter font-semibold text-xs">
                    Connect via wallet to show balance
                  </p>
                </div>
              )}

              {isRecipientAddressEditable && (
                <div className="mt-3 bg-grey-dark rounded-xl py-2 px-3">
                  <div className="text-grey-light font-semibold">
                    <input
                      className="w-full p-2 bg-transparent border border-white rounded-sm text-white"
                      type="text"
                      placeholder="Enter address"
                      onChange={updateRecipientAddressOverride}
                      value={recipientAddressOverride}
                    />
                    <div className="mt-3 flex space-x-2">
                      <button
                        type="button"
                        className="px-3 py-1 text-white bg-transparent border border-grey-medium rounded-lg hover:bg-grey-darker hover:border-white transition"
                        onClick={handleEditRecipientSave}
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        className="px-3 py-1 text-white bg-transparent border border-grey-medium rounded-lg hover:bg-grey-darker hover:border-white transition"
                        onClick={handleEditRecipientClear}
                      >
                        Clear
                      </button>
                    </div>
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
                <div className="text-status-danger mt-2">
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
      </div>
    </div>
  );
};
