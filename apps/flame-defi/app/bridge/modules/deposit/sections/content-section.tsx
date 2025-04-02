"use client";

import { FundButton, getOnrampBuyUrl } from "@coinbase/onchainkit/fund";
import React, { useMemo, useEffect, useCallback } from "react";

import { AnimatedArrowSpacer, Button } from "@repo/ui/components";
import { ArrowUpDownIcon, BaseIcon, WalletIcon } from "@repo/ui/icons";
import { formatDecimalValues, shortenAddress } from "@repo/ui/utils";
import { useDepositPageContext } from "bridge/modules/deposit/hooks/use-deposit-page-context";
import { SourceType } from "bridge/types";
import { Dropdown } from "components/dropdown";
import {
  AddErc20ToWalletButton,
} from "features/evm-wallet";

export const ContentSection = () => {
  const {
    selectedSourceType,
    handleSourceChainSelect,
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
    handleConnectEvmWallet,
    isDepositDisabled,
    additionalSourceOptions,
    additionalAstriaChainOptions,
    cosmosWallet,
    evmWallet,
    coinbaseWallet,
    handleDeposit,
  } = useDepositPageContext();

  // source chains only cosmos or coinbase chains for now
  const sourceChainOptions = useMemo(() => {
    const cosmosGroup = cosmosWallet.cosmosChainsOptions.map((option) => ({
      ...option,
      group: "cosmos-chains",
    }));

    const coinbaseGroup = coinbaseWallet.coinbaseChainsOptions.map(
      (option) => ({
        ...option,
        group: "coinbase-chains",
      }),
    );

    return [...cosmosGroup, ...coinbaseGroup];
  }, [cosmosWallet.cosmosChainsOptions, coinbaseWallet.coinbaseChainsOptions]);

  // TODO - implement FundButton correctly somewhere.
  //   right now i'm just showing it in arbitrary spot for testing.
  const coinbaseOnrampBuyUrl = useMemo(() => {
    if (!coinbaseWallet.coinbaseAccountAddress) {
      return;
    }
    // NOTE - will be sending to the user's connected Base account
    return getOnrampBuyUrl({
      projectId: "5e9f4c41-a90f-4eb5-b6a4-676eaf0f836d", // TODO - get from config
      addresses: {
        [coinbaseWallet.coinbaseAccountAddress]: ["base"],
      },
      assets: ["USDC"],
      presetFiatAmount: 20,
      fiatCurrency: "USD",
    });
  }, [coinbaseWallet.coinbaseAccountAddress]);

  // ensure evm wallet connection when selected EVM chain changes
  useEffect(() => {
    if (!evmWallet.selectedEvmChain) {
      return;
    }
    handleConnectEvmWallet();
  }, [evmWallet.selectedEvmChain, handleConnectEvmWallet]);

  // ensure cosmos wallet connection when selected ibc chain changes
  useEffect(() => {
    if (
      !cosmosWallet.selectedCosmosChain ||
      selectedSourceType !== SourceType.Cosmos
    ) {
      return;
    }
    cosmosWallet.connectCosmosWallet();
  }, [cosmosWallet, selectedSourceType]);

  // ensure coinbase wallet connection when selected coinbase chain changes
  useEffect(() => {
    if (
      !coinbaseWallet.selectedCoinbaseChain ||
      selectedSourceType !== SourceType.Coinbase
    ) {
      return;
    }
    coinbaseWallet.connectCoinbaseWallet();
  }, [coinbaseWallet, selectedSourceType]);

  // the evm currency selection is controlled by the chosen source currency,
  // and should be updated when an ibc currency or evm chain is selected
  // TODO - update to change when selectedCoinbaseCurrency is updated
  const selectedDestinationCurrencyOption = useMemo(() => {
    if (!cosmosWallet.selectedIbcCurrency) {
      return evmWallet.defaultEvmCurrencyOption;
    }
    const matchingEvmCurrency = evmWallet.selectedEvmChain?.currencies.find(
      (currency) =>
        currency.coinDenom === cosmosWallet.selectedIbcCurrency?.coinDenom,
    );
    if (!matchingEvmCurrency) {
      return null;
    }
    return {
      label: matchingEvmCurrency.coinDenom,
      value: matchingEvmCurrency,
      LeftIcon: matchingEvmCurrency.IconComponent,
    };
  }, [
    cosmosWallet.selectedIbcCurrency,
    evmWallet.selectedEvmChain,
    evmWallet.defaultEvmCurrencyOption,
  ]);

  const updateAmount = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(event.target.value);
  };

  const checkIsFormValid = useCallback(
    (addressInput: string | null, amountInput: string) => {
      if (addressInput === null) {
        setIsRecipientAddressValid(false);
        return;
      }
      // check that address is correct evm address format
      if (!addressInput.startsWith("0x")) {
        setIsRecipientAddressValid(false);
        return;
      }

      // FIXME - parseFloat is not sufficient
      const amount = Number.parseFloat(amountInput);
      const amountValid = amount > 0;
      setIsAmountValid(amountValid);
      // TODO - what validation should we do?
      const addressValid = addressInput.length > 0;
      setIsRecipientAddressValid(addressValid);
    },
    [setIsAmountValid, setIsRecipientAddressValid],
  );

  // check if form is valid whenever values change
  useEffect(() => {
    const anyWalletConnected =
      evmWallet.evmAccountAddress ||
      cosmosWallet.cosmosAccountAddress ||
      coinbaseWallet.coinbaseAccountAddress;
    if (anyWalletConnected || amount || recipientAddressOverride) {
      // have touched form when any wallet connected or amount/address changed
      setHasTouchedForm(true);
    }
    const recipientAddress =
      recipientAddressOverride || evmWallet.evmAccountAddress;
    checkIsFormValid(recipientAddress, amount);
  }, [
    evmWallet.evmAccountAddress,
    cosmosWallet.cosmosAccountAddress,
    coinbaseWallet.coinbaseAccountAddress,
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

  const formattedEvmBalanceValue = formatDecimalValues(
    evmWallet.selectedEvmCurrencyBalance?.value,
  );
  const formattedCosmosBalanceValue = formatDecimalValues(
    cosmosWallet.cosmosBalance?.value,
  );
  const formattedCoinbaseBalanceValue = formatDecimalValues(
    coinbaseWallet.selectedCoinbaseCurrencyBalance?.value,
  );

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
                {Boolean(coinbaseOnrampBuyUrl) && (
                  <div>
                    <FundButton fundingUrl={coinbaseOnrampBuyUrl} />
                  </div>
                )}
                <div className="flex flex-col sm:flex-row w-full gap-3">
                  <div className="grow">
                    <Dropdown
                      placeholder="Select chain..."
                      options={sourceChainOptions}
                      additionalOptions={additionalSourceOptions}
                      onSelect={handleSourceChainSelect}
                      valueOverride={
                        selectedSourceType === SourceType.Cosmos
                          ? cosmosWallet.selectedCosmosChainOption
                          : coinbaseWallet.selectedCoinbaseChainOption
                      }
                      LeftIcon={WalletIcon}
                    />
                  </div>

                  {/* Currency selection based on source type */}
                  {selectedSourceType === SourceType.Cosmos &&
                    cosmosWallet.selectedCosmosChain &&
                    cosmosWallet.ibcCurrencyOptions && (
                      <div className="w-full sm:w-auto">
                        <Dropdown
                          placeholder="Select a token"
                          options={cosmosWallet.ibcCurrencyOptions}
                          defaultOption={cosmosWallet.defaultIbcCurrencyOption}
                          onSelect={cosmosWallet.selectIbcCurrency}
                          LeftIcon={WalletIcon}
                        />
                      </div>
                    )}
                  {selectedSourceType === SourceType.Coinbase &&
                    coinbaseWallet.selectedCoinbaseChain &&
                    coinbaseWallet.coinbaseCurrencyOptions && (
                      <div className="w-full sm:w-auto">
                        <Dropdown
                          placeholder="Select a token"
                          options={coinbaseWallet.coinbaseCurrencyOptions}
                          defaultOption={
                            coinbaseWallet.defaultCoinbaseCurrencyOption
                          }
                          onSelect={coinbaseWallet.selectCoinbaseCurrency}
                          LeftIcon={BaseIcon}
                        />
                      </div>
                    )}
                </div>
              </div>

              {/* Source wallet info display based on source type */}
              {selectedSourceType === SourceType.Cosmos &&
                cosmosWallet.cosmosAccountAddress && (
                  <div className="mt-3 bg-grey-dark rounded-xl py-2 px-3">
                    <p className="text-grey-light font-semibold">
                      {/* TODO - refactor into some kind of `sourceAddress` variable */}
                      Address:{" "}
                      {shortenAddress(cosmosWallet.cosmosAccountAddress)}
                    </p>
                    {cosmosWallet.selectedIbcCurrency &&
                      !cosmosWallet.isLoadingCosmosBalance && (
                        <p className="mt-2 text-grey-lighter font-semibold">
                          {/* TODO - refactor into some kind of `sourceAccountBalance` variable */}
                          Balance: {formattedCosmosBalanceValue}{" "}
                          {cosmosWallet.cosmosBalance?.symbol}
                        </p>
                      )}
                    {cosmosWallet.isLoadingCosmosBalance && (
                      <p className="mt-2 text-grey-lighter font-semibold">
                        Balance: <i className="fas fa-spinner fa-pulse" />
                      </p>
                    )}
                  </div>
                )}

              {selectedSourceType === SourceType.Coinbase &&
                coinbaseWallet.coinbaseAccountAddress && (
                  <div className="mt-3 bg-grey-dark rounded-xl py-2 px-3">
                    <p className="text-grey-light font-semibold">
                      Address:{" "}
                      {shortenAddress(coinbaseWallet.coinbaseAccountAddress)}
                    </p>
                    {coinbaseWallet.selectedCoinbaseCurrency &&
                      !coinbaseWallet.isLoadingSelectedCoinbaseCurrencyBalance && (
                        <p className="mt-2 text-grey-lighter font-semibold">
                          Balance: {formattedCoinbaseBalanceValue}{" "}
                          {
                            coinbaseWallet.selectedCoinbaseCurrencyBalance
                              ?.symbol
                          }
                        </p>
                      )}
                    {coinbaseWallet.isLoadingSelectedCoinbaseCurrencyBalance && (
                      <p className="mt-2 text-grey-lighter font-semibold">
                        Balance: <i className="fas fa-spinner fa-pulse" />
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
                      options={evmWallet.evmChainsOptions}
                      onSelect={evmWallet.selectEvmChain}
                      additionalOptions={additionalAstriaChainOptions}
                      valueOverride={evmWallet.selectedEvmChainOption}
                      LeftIcon={WalletIcon}
                    />
                  </div>
                  {evmWallet.selectedEvmChain &&
                    evmWallet.evmCurrencyOptions && (
                      <div className="w-full sm:w-auto">
                        <Dropdown
                          placeholder="No matching token"
                          options={evmWallet.evmCurrencyOptions}
                          defaultOption={evmWallet.defaultEvmCurrencyOption}
                          onSelect={evmWallet.selectEvmCurrency}
                          valueOverride={selectedDestinationCurrencyOption}
                          disabled={true}
                        />
                      </div>
                    )}
                </div>
              </div>
              {evmWallet.evmAccountAddress &&
                !isRecipientAddressEditable &&
                !recipientAddressOverride && (
                  <div className="mt-3 rounded-xl p-4 transition border border-solid border-transparent bg-semi-white hover:border-grey-medium">
                    {evmWallet.evmAccountAddress && (
                      <p
                        className="text-grey-light font-semibold cursor-pointer"
                        onKeyDown={handleEditRecipientClick}
                        onClick={handleEditRecipientClick}
                      >
                        <span className="mr-2">
                          Address: {shortenAddress(evmWallet.evmAccountAddress)}
                        </span>
                        <i className="fas fa-pen-to-square" />
                      </p>
                    )}
                    {evmWallet.evmAccountAddress &&
                      evmWallet.selectedEvmChain &&
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
                    {selectedDestinationCurrencyOption?.value
                      ?.erc20ContractAddress &&
                      evmWallet.evmAccountAddress && (
                        <div className="mt-3">
                          <AddErc20ToWalletButton
                            evmCurrency={
                              selectedDestinationCurrencyOption.value
                            }
                          />
                        </div>
                      )}
                  </div>
                )}
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
            <Button
              variant="gradient"
              onClick={handleDeposit}
              disabled={isDepositDisabled}
            >
              {isLoading ? "Processing..." : "Deposit"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
