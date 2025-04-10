"use client";

import { FundButton, getOnrampBuyUrl } from "@coinbase/onchainkit/fund";
import React, { useCallback, useEffect, useMemo } from "react";

import { AnimatedArrowSpacer, Button } from "@repo/ui/components";
// import { ArrowUpDownIcon, BaseIcon, WalletIcon } from "@repo/ui/icons";
import { ArrowUpDownIcon, WalletIcon } from "@repo/ui/icons";
import { formatDecimalValues, shortenAddress } from "@repo/ui/utils";
import { useDepositPageContext } from "bridge/modules/deposit/hooks/use-deposit-page-context";
import { Dropdown } from "components/dropdown";
import { AddErc20ToWalletButton } from "features/evm-wallet";
import {
  AstriaChain,
  ChainType,
  EvmCurrency,
  IbcCurrency,
} from "@repo/flame-types";

export const ContentSection = () => {
  const {
    sourceChain,
    handleSourceChainSelect,
    sourceCurrency,
    setSourceCurrency,
    destinationChain,
    handleDestinationChainSelect,
    destinationCurrency,
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
    handleConnectEvmWallet,
    isDepositDisabled,
    additionalSourceOptions,
    additionalAstriaChainOptions,
    cosmosWallet,
    evmWallet,
    handleDeposit,
  } = useDepositPageContext();

  console.log({
    sourceChain,
    destinationChain,
  });

  // TODO - implement FundButton correctly somewhere.
  //   right now i'm just showing it in arbitrary spot for testing.
  const coinbaseOnrampBuyUrl = useMemo(() => {
    if (!evmWallet.evmAccountAddress) {
      return;
    }
    // NOTE - will be sending to the user's connected Base account
    return getOnrampBuyUrl({
      projectId: "5e9f4c41-a90f-4eb5-b6a4-676eaf0f836d", // TODO - get from config
      addresses: {
        [evmWallet.evmAccountAddress]: ["base"],
      },
      assets: ["USDC"],
      presetFiatAmount: 20,
      fiatCurrency: "USD",
    });
  }, [evmWallet.evmAccountAddress]);

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
      sourceChain.chain?.chainType !== ChainType.COSMOS
    ) {
      return;
    }
    cosmosWallet.connectCosmosWallet();
  }, [cosmosWallet, sourceChain.chain?.chainType]);

  // source chains only cosmos or coinbase chains for now
  const sourceChainOptions = useMemo(() => {
    const evmChains = evmWallet.coinbaseChains.map((c) => ({
      label: c.chainName,
      value: c,
      LeftIcon: c.IconComponent,
    }));
    return [...cosmosWallet.cosmosChainsOptions, ...evmChains];
  }, [cosmosWallet.cosmosChainsOptions, evmWallet.coinbaseChains]);

  const sourceChainOption = useMemo(() => {
    if (!sourceChain.chain) {
      return null;
    }
    return {
      label: sourceChain.chain.chainName,
      value: sourceChain.chain as AstriaChain,
      LeftIcon: sourceChain.chain.IconComponent,
    };
  }, [sourceChain.chain]);

  const defaultSourceCurrencyOption = useMemo(() => {
    if (!sourceChain.chain || !sourceChain.chain.currencies) {
      return;
    }
    // use the first currency from the source chain as default
    let defaultCurrency = sourceChain.chain.currencies[0] as IbcCurrency;
    if (sourceChain.chain.chainType === ChainType.EVM) {
      defaultCurrency = sourceChain.chain.currencies.find(
        (c) => c.astriaIntentBridgeAddress,
      ) as EvmCurrency;
    }
    return {
      label: defaultCurrency.coinDenom,
      value: defaultCurrency,
      LeftIcon: defaultCurrency.IconComponent,
    };
  }, [sourceChain.chain]);

  const sourceCurrencyOptions = useMemo(() => {
    if (!sourceChain.chain) {
      return [];
    }
    if (sourceChain.chain.chainType === ChainType.COSMOS) {
      return cosmosWallet.ibcCurrencyOptions || [];
    }
    if (sourceChain.chain.chainType === ChainType.EVM) {
      return (
        sourceChain.chain.currencies
          ?.filter((c) => c.astriaIntentBridgeAddress)
          .map((c) => ({
            label: c.coinDenom,
            value: c,
            LeftIcon: c.IconComponent,
          })) || []
      );
    }
    return [];
  }, [cosmosWallet.ibcCurrencyOptions, sourceChain.chain]);

  const destinationChainOptions = useMemo(() => {
    return evmWallet.astriaChains.map((c) => ({
      label: c.chainName,
      value: c,
      LeftIcon: c.IconComponent,
    }));
  }, [evmWallet.astriaChains]);

  const destinationChainOption = useMemo(() => {
    if (!destinationChain.chain) {
      return null;
    }
    return {
      label: destinationChain.chain.chainName,
      value: destinationChain.chain as AstriaChain,
      LeftIcon: destinationChain.chain.IconComponent,
    };
  }, [destinationChain.chain]);

  const defaultDestinationCurrencyOption = useMemo(() => {
    if (!destinationChain.chain || !destinationChain.chain.currencies) {
      return;
    }
    // use the first currency from the source chain as default
    const defaultCurrency = destinationChain.chain.currencies[0];
    return {
      label: defaultCurrency.coinDenom,
      value: defaultCurrency as EvmCurrency,
      LeftIcon: defaultCurrency.IconComponent,
    };
  }, [destinationChain.chain]);

  const destinationCurrencyOptions = useMemo(() => {
    if (!destinationChain.chain) {
      return [];
    }
    return (
      destinationChain.chain.currencies?.map((currency) => ({
        label: currency.coinDenom,
        value: currency as EvmCurrency,
        LeftIcon: currency.IconComponent,
      })) || []
    );
  }, [destinationChain.chain]);

  // the evm currency selection is controlled by the chosen source currency
  const destinationCurrencyOption = useMemo(() => {
    if (!sourceChain.chain || !sourceCurrency) {
      return defaultDestinationCurrencyOption;
    }
    const matchingEvmCurrency = destinationChain.chain?.currencies.find(
      (currency) => currency.coinDenom === sourceCurrency.coinDenom,
    );
    if (!matchingEvmCurrency) {
      return null;
    }
    return {
      label: matchingEvmCurrency.coinDenom,
      value: matchingEvmCurrency as EvmCurrency,
      LeftIcon: matchingEvmCurrency.IconComponent,
    };
  }, [
    sourceChain.chain,
    sourceCurrency,
    destinationChain.chain?.currencies,
    defaultDestinationCurrencyOption,
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
      evmWallet.evmAccountAddress;
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

  // FIXME - show balance correctly
  const formattedEvmBalanceValue = formatDecimalValues("0");
  const formattedCosmosBalanceValue = formatDecimalValues(
    cosmosWallet.cosmosBalance?.value,
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
                      valueOverride={sourceChainOption}
                      LeftIcon={WalletIcon}
                    />
                  </div>

                  {sourceChain.chain && (
                    <div className="w-full sm:w-auto">
                      <Dropdown
                        placeholder="Select a token"
                        options={sourceCurrencyOptions}
                        defaultOption={defaultSourceCurrencyOption}
                        onSelect={setSourceCurrency}
                        LeftIcon={WalletIcon}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Source wallet info display based on source type */}
              {sourceChain.chain?.chainType === ChainType.COSMOS &&
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

              {sourceChain.chain?.chainType === ChainType.EVM &&
                sourceChain.address && (
                  <div className="mt-3 bg-grey-dark rounded-xl py-2 px-3">
                    <p className="text-grey-light font-semibold">
                      Address: {shortenAddress(sourceChain.address)}
                    </p>
                    {sourceCurrency &&
                      !evmWallet.isLoadingSelectedEvmCurrencyBalance && (
                        <p className="mt-2 text-grey-lighter font-semibold">
                          {/* FIXME - get balance correctly */}
                          Balance: {formattedEvmBalanceValue}{" "}
                          {sourceCurrency.coinDenom}
                        </p>
                      )}
                    {evmWallet.isLoadingSelectedEvmCurrencyBalance && (
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
                      options={destinationChainOptions}
                      onSelect={handleDestinationChainSelect}
                      additionalOptions={additionalAstriaChainOptions}
                      valueOverride={destinationChainOption}
                      LeftIcon={WalletIcon}
                    />
                  </div>
                  {destinationChain.chain && (
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
              {destinationChain.address &&
                !isRecipientAddressEditable &&
                !recipientAddressOverride && (
                  <div className="mt-3 rounded-xl p-4 transition border border-solid border-transparent bg-semi-white hover:border-grey-medium">
                    {destinationChain.address && (
                      <p
                        className="text-grey-light font-semibold cursor-pointer"
                        onKeyDown={handleEditRecipientClick}
                        onClick={handleEditRecipientClick}
                      >
                        <span className="mr-2">
                          Address: {shortenAddress(destinationChain.address)}
                        </span>
                        <i className="fas fa-pen-to-square" />
                      </p>
                    )}
                    {destinationChain.chain &&
                      destinationCurrency &&
                      !evmWallet.isLoadingSelectedEvmCurrencyBalance && (
                        <p className="mt-2 text-grey-lighter font-semibold">
                          Balance: {formattedEvmBalanceValue}{" "}
                          {destinationCurrency.coinDenom}
                        </p>
                      )}
                    {evmWallet.evmAccountAddress &&
                      evmWallet.isLoadingSelectedEvmCurrencyBalance && (
                        <p className="mt-2 text-grey-lighter font-semibold">
                          Balance: <i className="fas fa-spinner fa-pulse" />
                        </p>
                      )}
                    {destinationCurrencyOption?.value?.erc20ContractAddress &&
                      evmWallet.evmAccountAddress && (
                        <div className="mt-3">
                          <AddErc20ToWalletButton
                            evmCurrency={destinationCurrencyOption.value}
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
