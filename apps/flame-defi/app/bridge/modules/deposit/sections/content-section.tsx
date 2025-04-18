"use client";

// import { FundButton, getOnrampBuyUrl } from "@coinbase/onchainkit/fund";
import React, { useCallback, useEffect, useMemo } from "react";

import { AnimatedArrowSpacer, Button } from "@repo/ui/components";
import {
  ArrowUpDownIcon,
  BaseIcon,
  EditIcon,
  PlusIcon,
  WalletIcon,
} from "@repo/ui/icons";
import { formatDecimalValues, shortenAddress } from "@repo/ui/utils";
import { useDepositPageContext } from "bridge/modules/deposit/hooks/use-deposit-page-context";
import { BridgeConnectionsModal } from "bridge/components/bridge-connections-modal";
import { Dropdown } from "components/dropdown";
import { AddErc20ToWalletButton } from "features/evm-wallet";
import { EvmCurrency } from "@repo/flame-types";
import { useDepositOptions } from "../../../hooks/use-deposit-options";

export const ContentSection = () => {
  const {
    sourceChainSelection,
    handleSourceChainSelect,
    setSourceCurrency,
    destinationChainSelection,
    handleDestinationChainSelect,
    setDestinationCurrency,
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
    isDepositDisabled,
    handleDeposit,
  } = useDepositPageContext();

  const {
    sourceChainOptions,
    destinationChainOptions,
    getSourceCurrencyOptions,
    getDestinationCurrencyOptions,
    findMatchingDestinationCurrency,
  } = useDepositOptions();

  // additional options
  const additionalSourceOptions = useMemo(
    () => [
      {
        label: "Fund with Coinbase OnRamp",
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

  const additionalDestinationOptions = useMemo(() => {
    return [
      {
        label: "Enter address manually",
        action: handleEditRecipientClick,
        className: "has-text-primary",
        RightIcon: EditIcon,
      },
    ];
  }, [handleEditRecipientClick]);

  // TODO - coinbase onramp url
  // Set up Coinbase onramp button URL
  // const coinbaseOnrampBuyUrl = useMemo(() => {
  //   if (!evmWallet.evmAccountAddress) {
  //     return undefined;
  //   }
  //
  //   return getOnrampBuyUrl({
  //     projectId: "5e9f4c41-a90f-4eb5-b6a4-676eaf0f836d", // TODO - get from config
  //     // FIXME - does passing in address here mean we have to create the account first?
  //     addresses: {
  //       [evmWallet.evmAccountAddress]: ["base"],
  //     },
  //     assets: ["USDC"],
  //     presetFiatAmount: 20,
  //     fiatCurrency: "USD",
  //   });
  // }, [evmWallet.evmAccountAddress]);

  // Use the utility functions from useDepositOptions
  const sourceCurrencyOptions = getSourceCurrencyOptions(
    sourceChainSelection.chain,
  );
  const destinationCurrencyOptions = getDestinationCurrencyOptions(
    destinationChainSelection.chain,
  );
  const defaultDestinationCurrencyOption = destinationCurrencyOptions[0];

  // Find matching destination currency using the helper function
  const destinationCurrencyOption =
    findMatchingDestinationCurrency(
      sourceChainSelection.chain,
      sourceChainSelection.currency,
      destinationChainSelection.chain,
    ) || defaultDestinationCurrencyOption;

  // Form handling
  const updateAmount = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(event.target.value);
  };

  const checkIsFormValid = useCallback(
    (addressInput: string | null, amountInput: string) => {
      if (addressInput === null) {
        setIsRecipientAddressValid(false);
        return;
      }

      // Check that address is correct EVM address format
      if (!addressInput.startsWith("0x")) {
        setIsRecipientAddressValid(false);
        return;
      }

      const amount = Number.parseFloat(amountInput);
      const amountValid = amount > 0;
      setIsAmountValid(amountValid);

      const addressValid = addressInput.length > 0;
      setIsRecipientAddressValid(addressValid);
    },
    [setIsAmountValid, setIsRecipientAddressValid],
  );

  // Check if form is valid whenever values change
  useEffect(() => {
    // Mark form as touched when any values change or wallet connects
    if (sourceChainSelection.address || amount || recipientAddressOverride) {
      setHasTouchedForm(true);
    }

    // Use the recipient address from either override or destination chain
    const recipientAddress =
      recipientAddressOverride || destinationChainSelection.address;
    checkIsFormValid(recipientAddress, amount);
  }, [
    sourceChainSelection.address,
    destinationChainSelection.address,
    amount,
    recipientAddressOverride,
    checkIsFormValid,
    setHasTouchedForm,
  ]);

  const updateRecipientAddressOverride = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setRecipientAddressOverride(event.target.value);
  };

  // Format balance values - simplified for now
  const formattedBalanceValue = formatDecimalValues("0");

  return (
    <div className="w-full min-h-[calc(100vh-85px-96px)] flex flex-col items-center">
      <div className="w-full px-0 md:w-[675px] lg:px-4">
        <div className="px-4 py-12 sm:px-4 lg:p-12 bg-[radial-gradient(144.23%_141.13%_at_50.15%_0%,#221F1F_0%,#050A0D_100%)] shadow-[inset_1px_1px_1px_-1px_rgba(255,255,255,0.5)] rounded-2xl">
          <div>
            <div className="flex flex-col">
              <div className="mb-2 sm:hidden">From</div>
              <div className="flex flex-col sm:flex-row sm:items-center">
                <div className="hidden sm:block sm:mr-4 sm:min-w-[60px]">
                  From
                </div>
                {/*{Boolean(coinbaseOnrampBuyUrl) && (*/}
                {/*  <div>*/}
                {/*    <FundButton fundingUrl={coinbaseOnrampBuyUrl} />*/}
                {/*  </div>*/}
                {/*)}*/}
                <div className="flex flex-col sm:flex-row w-full gap-3">
                  <div className="grow">
                    <Dropdown
                      placeholder="Select chain..."
                      options={sourceChainOptions}
                      additionalOptions={additionalSourceOptions}
                      onSelect={handleSourceChainSelect}
                      LeftIcon={WalletIcon}
                    />
                  </div>

                  {sourceChainSelection.chain && (
                    <div className="w-full sm:w-auto">
                      <Dropdown
                        placeholder="Select a token"
                        options={sourceCurrencyOptions}
                        defaultOption={sourceCurrencyOptions[0]}
                        onSelect={setSourceCurrency}
                        LeftIcon={WalletIcon}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Source wallet info - unified display regardless of chain type */}
              {sourceChainSelection.address && (
                <div className="mt-3 bg-grey-dark rounded-xl py-2 px-3">
                  <p className="text-grey-light font-semibold">
                    Address: {shortenAddress(sourceChainSelection.address)}
                  </p>
                  {sourceChainSelection.currency && (
                    <p className="mt-2 text-grey-lighter font-semibold">
                      Balance: {formattedBalanceValue}{" "}
                      {sourceChainSelection.currency.coinDenom}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {isAnimating ? (
            <AnimatedArrowSpacer isAnimating={isAnimating} />
          ) : (
            <div className="flex flex-row justify-center sm:justify-start mt-4 sm:my-4 h-[40px]">
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
                      placeholder="Connect Astria wallet or enter address"
                      options={destinationChainOptions}
                      onSelect={handleDestinationChainSelect}
                      additionalOptions={additionalDestinationOptions}
                      LeftIcon={WalletIcon}
                    />
                  </div>
                  {destinationChainSelection.chain && (
                    <div className="w-full sm:w-auto">
                      <Dropdown
                        placeholder="No matching token"
                        options={destinationCurrencyOptions}
                        defaultOption={defaultDestinationCurrencyOption}
                        onSelect={setDestinationCurrency}
                        valueOverride={destinationCurrencyOption}
                        disabled={true}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Destination address display - when using wallet address */}
              {destinationChainSelection.address &&
                !isRecipientAddressEditable &&
                !recipientAddressOverride && (
                  <div className="mt-3 rounded-xl p-4 transition border border-solid border-transparent bg-semi-white hover:border-grey-medium">
                    <p
                      className="text-grey-light font-semibold cursor-pointer"
                      onKeyDown={handleEditRecipientClick}
                      onClick={handleEditRecipientClick}
                    >
                      <span className="mr-2">
                        Address:{" "}
                        {shortenAddress(destinationChainSelection.address)}
                      </span>
                      <i className="fas fa-pen-to-square" />
                    </p>
                    {destinationChainSelection.currency && (
                      <p className="mt-2 text-grey-lighter font-semibold">
                        Balance: {formattedBalanceValue}{" "}
                        {destinationChainSelection.currency.coinDenom}
                      </p>
                    )}
                    {destinationCurrencyOption?.value &&
                      "erc20ContractAddress" in
                        destinationCurrencyOption.value &&
                      destinationChainSelection.address && (
                        <div className="mt-3">
                          <AddErc20ToWalletButton
                            evmCurrency={
                              destinationCurrencyOption.value as EvmCurrency
                            }
                          />
                        </div>
                      )}
                  </div>
                )}

              {/* Destination address display - when using manual address */}
              {recipientAddressOverride && !isRecipientAddressEditable && (
                <div className="mt-3 rounded-xl p-4 transition border border-solid border-transparent bg-semi-white hover:border-grey-medium">
                  <p
                    className="text-grey-light font-semibold cursor-pointer"
                    onKeyDown={handleEditRecipientClick}
                    onClick={handleEditRecipientClick}
                  >
                    <span className="mr-2">
                      Address: {shortenAddress(recipientAddressOverride)}
                    </span>
                    <i className="fas fa-pen-to-square" />
                  </p>
                  {!isRecipientAddressValid && hasTouchedForm && (
                    <div className="text-status-danger mt-2">
                      Recipient address must be a valid EVM address
                    </div>
                  )}
                  <p className="mt-2 text-grey-lighter font-semibold text-sm">
                    Connect via wallet to show balance
                  </p>
                </div>
              )}

              {/* Address input form when editing */}
              {isRecipientAddressEditable && (
                <div className="mt-3 rounded-xl p-4 transition border border-solid border-grey-medium bg-semi-white">
                  <div className="text-grey-light font-semibold">
                    <input
                      className="w-full p-3 bg-transparent border border-grey-dark focus:border-white focus:outline-hidden rounded-xl text-white"
                      type="text"
                      placeholder="0x..."
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

          <div className="flex flex-row items-center">
            <div className="border-t border-grey-dark my-4 w-full" />
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
            </div>
            {!isAmountValid && hasTouchedForm && (
              <div className="text-status-danger mt-2">
                Amount must be a number greater than 0
              </div>
            )}
          </div>

          <div className="mt-4">
            {!sourceChainSelection.address ||
            !destinationChainSelection.address ? (
              <BridgeConnectionsModal>
                <Button variant="gradient">Connect Wallet</Button>
              </BridgeConnectionsModal>
            ) : (
              <Button
                variant="gradient"
                onClick={handleDeposit}
                disabled={isDepositDisabled}
              >
                {isLoading ? "Processing..." : "Deposit"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
