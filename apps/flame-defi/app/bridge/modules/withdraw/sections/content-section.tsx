"use client";

import React, { useMemo, useEffect, useCallback } from "react";

import { AnimatedArrowSpacer, Button } from "@repo/ui/components";
import { ArrowUpDownIcon, WalletIcon } from "@repo/ui/icons";
import { shortenAddress } from "@repo/ui/utils";
import { useWithdrawPageContext } from "bridge/modules/withdraw/hooks/use-withdraw-page-context";
import { BridgeConnectionsModal } from "bridge/components/bridge-connections-modal";
import { Dropdown } from "components/dropdown";

export const ContentSection = () => {
  const {
    amount,
    setAmount,
    isAmountValid,
    setIsAmountValid,
    hasTouchedForm,
    setHasTouchedForm,
    isLoading,
    isAnimating,
    recipientAddressOverride,
    isRecipientAddressEditable,
    handleEditRecipientClick,
    handleEditRecipientSave,
    handleEditRecipientClear,
    isRecipientAddressValid,
    setIsRecipientAddressValid,
    setRecipientAddressOverride,
    // handleConnectCosmosWallet,
    isWithdrawDisabled,
    additionalCosmosOptions,
    cosmosWallet,
    handleWithdraw,
  } = useWithdrawPageContext();

  // Simplified selected cosmos currency option
  const selectedCosmosCurrencyOption = useMemo(() => {
    if (cosmosWallet.defaultIbcCurrencyOption) {
      return cosmosWallet.defaultIbcCurrencyOption;
    }
    return null;
  }, [cosmosWallet.defaultIbcCurrencyOption]);

  const updateAmount = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(event.target.value);
  };

  // Simplified form validation
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

  // Form validation effect
  useEffect(() => {
    if (amount || recipientAddressOverride) {
      setHasTouchedForm(true);
    }
    const recipientAddress = recipientAddressOverride || "mock-address";
    checkIsFormValid(recipientAddress, amount);
  }, [amount, checkIsFormValid, recipientAddressOverride, setHasTouchedForm]);

  const updateRecipientAddressOverride = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setRecipientAddressOverride(event.target.value);
  };

  // Mock formatted values for display
  const formattedCosmosBalanceValue = "5.678";

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
                      placeholder="Connect Wallet"
                      options={[]}
                      onSelect={() => {}}
                      LeftIcon={WalletIcon}
                    />
                  </div>
                </div>
              </div>
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
                      >
                        <span className="mr-2">
                          Address:{" "}
                          {shortenAddress(cosmosWallet.cosmosAccountAddress)}
                        </span>
                        <i className="fas fa-pen-to-square" />
                      </p>
                    )}
                    {cosmosWallet.cosmosAccountAddress && (
                      <p className="mt-2 text-grey-lighter font-semibold">
                        Balance: {formattedCosmosBalanceValue}{" "}
                        {cosmosWallet.selectedIbcCurrency?.coinDenom || "TIA"}
                      </p>
                    )}
                    {/* TODO - ibcWithdrawFeeDisplay */}
                    <div className="mt-2 text-grey-light text-sm">
                      Withdrawal fee: 0.001 FLAME
                    </div>
                  </div>
                )}

              {recipientAddressOverride && !isRecipientAddressEditable && (
                <div className="mt-3 bg-grey-dark rounded-xl py-2 px-3">
                  <p
                    className="text-grey-light font-semibold cursor-pointer"
                    onClick={handleEditRecipientClick}
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
            {!cosmosWallet.cosmosAccountAddress ? (
              <BridgeConnectionsModal>
                <Button variant="gradient">Connect Wallet</Button>
              </BridgeConnectionsModal>
            ) : (
              <Button
                variant="gradient"
                onClick={handleWithdraw}
                disabled={isWithdrawDisabled}
              >
                {isLoading ? "Processing..." : "Withdraw"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
