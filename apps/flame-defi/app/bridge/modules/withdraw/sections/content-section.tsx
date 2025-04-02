"use client";

import { AnimatedArrowSpacer, Button } from "@repo/ui/components";
import { ArrowUpDownIcon, WalletIcon } from "@repo/ui/icons";
import { formatDecimalValues, shortenAddress } from "@repo/ui/utils";
import { Dropdown } from "components/dropdown";
import {
  AddErc20ToWalletButton,
  createWithdrawerService,
} from "features/evm-wallet";
import { NotificationType } from "features/notifications";
import { useWithdrawPageContext } from "../hooks/use-withdraw-page-context";
import React, { useEffect } from "react";

export const ContentSection = () => {
  const {
    amount,
    setAmount,
    isAmountValid,
    hasTouchedForm,
    isLoading,
    setIsLoading,
    isAnimating,
    setIsAnimating,
    recipientAddressOverride,
    isRecipientAddressEditable,
    handleEditRecipientClick,
    handleEditRecipientSave,
    handleEditRecipientClear,
    handleConnectCosmosWallet,
    isWithdrawDisabled,
    cosmosWallet,
    evmWallet,
    additionalIbcOptions,
    additionalEvmOptions,
  } = useWithdrawPageContext();

  // the ibc currency selection is controlled by the sender's chosen evm currency,
  // and should be updated when an ibc currency or ibc chain is selected
  const selectedIbcCurrencyOption = React.useMemo(() => {
    if (!evmWallet.selectedEvmCurrency) {
      return cosmosWallet.defaultIbcCurrencyOption;
    }
    const matchingIbcCurrency =
      cosmosWallet.selectedCosmosChain?.currencies.find(
        (currency) =>
          currency.coinDenom === evmWallet.selectedEvmCurrency.coinDenom,
      );
    if (!matchingIbcCurrency) {
      return null;
    }
    return {
      label: matchingIbcCurrency.coinDenom,
      value: matchingIbcCurrency,
      LeftIcon: matchingIbcCurrency.IconComponent,
    };
  }, [
    evmWallet.selectedEvmCurrency,
    cosmosWallet.selectedCosmosChain,
    cosmosWallet.defaultIbcCurrencyOption,
  ]);

  useEffect(() => {
    if (
      amount ||
      cosmosWallet.cosmosAccountAddress ||
      recipientAddressOverride
    ) {
      // setHasTouchedForm(true);
    }
    const recipientAddress =
      recipientAddressOverride || cosmosWallet.cosmosAccountAddress || null;
    checkIsFormValid(recipientAddress, amount);
  }, [amount, cosmosWallet.cosmosAccountAddress, recipientAddressOverride]);

  const updateAmount = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(event.target.value);
  };

  const checkIsFormValid = (
    recipientAddressInput: string | null,
    amountInput: string,
  ) => {
    // This is just a stub and would be implemented in the context
  };

  // ensure evm wallet connection when selected EVM chain changes
  useEffect(() => {
    if (!evmWallet.selectedEvmChain) {
      return;
    }
    evmWallet.connectEvmWallet();
  }, [evmWallet]);

  // ensure cosmos wallet connection when selected ibc chain changes
  useEffect(() => {
    if (!cosmosWallet.selectedCosmosChain) {
      return;
    }
    handleConnectCosmosWallet();
  }, [cosmosWallet.selectedCosmosChain, handleConnectCosmosWallet]);

  const handleWithdraw = async () => {
    if (!evmWallet.selectedEvmChain || !evmWallet.selectedEvmCurrency) {
      evmWallet.addNotification({
        toastOpts: {
          toastType: NotificationType.WARNING,
          message: "Please select a chain and token to bridge first.",
          onAcknowledge: () => {},
        },
      });
      return;
    }

    const recipientAddress =
      recipientAddressOverride || cosmosWallet.cosmosAccountAddress;
    if (!evmWallet.evmAccountAddress || !recipientAddress) {
      evmWallet.addNotification({
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
      // shouldn't really fall into this case
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
        // NOTE - we started with only cosmos chains so they were all ibc withdrawals previously,
        //  but we will be supporting Base withdrawals soon probably
        throw new Error("Base withdrawals coming soon but not yet supported.");
      }
      const withdrawerSvc = createWithdrawerService(
        evmWallet.wagmiConfig,
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
      evmWallet.addNotification({
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
      evmWallet.addNotification({
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

  const updateRecipientAddressOverride = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    // This would be implemented in the context
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
                      additionalOptions={additionalIbcOptions}
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
                          valueOverride={selectedIbcCurrencyOption}
                          disabled={true}
                        />
                      </div>
                    )}
                </div>
              </div>

              {cosmosWallet.cosmosAccountAddress &&
                !isRecipientAddressEditable &&
                !recipientAddressOverride && (
                  <div className="mt-3 py-2 px-3 rounded-xl bg-grey-dark">
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
                  {/* Form validation message would go here */}
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
      </div>
    </div>
  );
};
