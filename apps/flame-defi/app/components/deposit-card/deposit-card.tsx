"use client";

import { FundButton, getOnrampBuyUrl } from "@coinbase/onchainkit/fund";
import { Decimal } from "@cosmjs/math";
import { type Config } from "@wagmi/core";
import { AnimatedArrowSpacer, Button } from "@repo/ui/components";
import { useConfig } from "wagmi";
import {
  ArrowUpDownIcon,
  BaseIcon,
  EditIcon,
  PlusIcon,
  WalletIcon,
} from "@repo/ui/icons";
import { formatDecimalValues, shortenAddress } from "@repo/ui/utils";
import { Dropdown } from "components/dropdown";
import { useCoinbaseWallet } from "features/coinbase-wallet";
import { sendIbcTransfer, useCosmosWallet } from "features/cosmos-wallet";
import { AddErc20ToWalletButton, useEvmWallet } from "features/evm-wallet";
import { NotificationType, useNotifications } from "features/notifications";
import type React from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { CoinbaseChain, CosmosChainInfo } from "@repo/flame-types";
import { createErc20Service } from "../../features/evm-wallet/services/erc-20-service/erc-20-service";

// Define an enum for the source types
enum SourceType {
  Cosmos = "cosmos",
  EVM = "evm",
  Coinbase = "coinbase",
}

export default function DepositCard(): React.ReactElement {
  const { addNotification } = useNotifications();
  const wagmiConfig: Config = useConfig();

  const [selectedSourceType, setSelectedSourceType] = useState<SourceType>(
    SourceType.Cosmos,
  );

  const {
    evmAccountAddress, // TODO - rename astriaAccountAddress
    selectEvmChain,
    evmChainsOptions,
    selectedEvmChain,
    selectedEvmChainOption,
    defaultEvmCurrencyOption,
    selectEvmCurrency,
    evmCurrencyOptions,
    selectedEvmCurrencyBalance,
    isLoadingSelectedEvmCurrencyBalance,
    connectEvmWallet,
    resetState: resetAstriaWalletState,
  } = useEvmWallet();

  const {
    cosmosAccountAddress,
    selectCosmosChain,
    cosmosChainsOptions,
    selectedCosmosChain,
    selectedCosmosChainOption,
    defaultIbcCurrencyOption,
    selectIbcCurrency,
    selectedIbcCurrency,
    ibcCurrencyOptions,
    cosmosBalance,
    isLoadingCosmosBalance,
    connectCosmosWallet,
    getCosmosSigningClient,
    // resetState: resetCosmosWalletState,
  } = useCosmosWallet();

  const {
    coinbaseAccountAddress,
    selectCoinbaseChain,
    coinbaseChainsOptions,
    selectedCoinbaseChain,
    selectedCoinbaseChainOption,
    defaultCoinbaseCurrencyOption,
    selectCoinbaseCurrency,
    selectedCoinbaseCurrency,
    coinbaseCurrencyOptions,
    selectedCoinbaseCurrencyBalance,
    isLoadingSelectedCoinbaseCurrencyBalance,
    connectCoinbaseWallet,
    // resetState: resetCoinbaseWalletState,
  } = useCoinbaseWallet();

  // source chains only cosmos or coinbase chains for now
  const sourceChainOptions = useMemo(() => {
    const cosmosGroup = cosmosChainsOptions.map((option) => ({
      ...option,
      group: "cosmos-chains",
    }));

    const coinbaseGroup = coinbaseChainsOptions.map((option) => ({
      ...option,
      group: "coinbase-chains",
    }));

    return [...cosmosGroup, ...coinbaseGroup];
  }, [cosmosChainsOptions, coinbaseChainsOptions]);

  const additionalSourceOptions = [
    {
      label: "Fund with Coinbase OnRamp",
      action: () => {
        // TODO - refactor dropdown to support custom component for additional option?
        //  can then pass in onchainkit's FundButton
        console.log("Coinbase OnRamp clicked");
      },
      className: "text-white",
      LeftIcon: BaseIcon,
      RightIcon: PlusIcon,
    },
  ];

  const coinbaseOnrampBuyUrl = useMemo(() => {
    if (!coinbaseAccountAddress) {
      return;
    }
    // NOTE - will be sending to the user's connected Base account
    return getOnrampBuyUrl({
      projectId: "5e9f4c41-a90f-4eb5-b6a4-676eaf0f836d", // TODO - get from config
      addresses: {
        [coinbaseAccountAddress]: ["base"],
      },
      assets: ["USDC"],
      presetFiatAmount: 20,
      fiatCurrency: "USD",
    });
  }, [coinbaseAccountAddress]);

  const handleSourceChainSelect = (
    chainValue: CosmosChainInfo | CoinbaseChain,
  ) => {
    // determine which type of chain was selected
    const cosmosChain = cosmosChainsOptions.find(
      (option) => option.value === chainValue,
    );
    if (cosmosChain) {
      setSelectedSourceType(SourceType.Cosmos);
      selectCosmosChain(chainValue as CosmosChainInfo);
      connectCosmosWallet();
      return;
    }

    const coinbaseChain = coinbaseChainsOptions.find(
      (option) => option.value === chainValue,
    );
    if (coinbaseChain) {
      setSelectedSourceType(SourceType.Coinbase);
      selectCoinbaseChain(chainValue as CoinbaseChain);
      // TODO - connect coinbase wallet?
      //   or are we just doing Coinbase OnRamp for now?
      return;
    }
  };

  // Get the current source address based on the selected source type
  const getActiveSourceAddress = useCallback((): string | null => {
    switch (selectedSourceType) {
      case SourceType.Cosmos:
        return cosmosAccountAddress;
      case SourceType.Coinbase:
        return coinbaseAccountAddress;
      default:
        return null;
    }
  }, [selectedSourceType, cosmosAccountAddress, coinbaseAccountAddress]);

  // ensure cosmos wallet connection when selected ibc chain changes
  useEffect(() => {
    if (!selectedCosmosChain || selectedSourceType !== SourceType.Cosmos) {
      return;
    }
    connectCosmosWallet();
  }, [selectedCosmosChain, connectCosmosWallet, selectedSourceType]);

  // ensure coinbase wallet connection when selected coinbase chain changes
  useEffect(() => {
    if (!selectedCoinbaseChain || selectedSourceType !== SourceType.Coinbase) {
      return;
    }
    connectCoinbaseWallet();
  }, [selectedCoinbaseChain, connectCoinbaseWallet, selectedSourceType]);

  // the evm currency selection is controlled by the chosen source currency,
  // and should be updated when an ibc currency or evm chain is selected
  // TODO - update to change when selectedCoinbaseCurrency is updated
  const selectedDestinationCurrencyOption = useMemo(() => {
    if (!selectedIbcCurrency) {
      return defaultEvmCurrencyOption;
    }
    const matchingEvmCurrency = selectedEvmChain?.currencies.find(
      (currency) => currency.coinDenom === selectedIbcCurrency.coinDenom,
    );
    if (!matchingEvmCurrency) {
      return null;
    }
    return {
      label: matchingEvmCurrency.coinDenom,
      value: matchingEvmCurrency,
      LeftIcon: matchingEvmCurrency.IconComponent,
    };
  }, [selectedIbcCurrency, selectedEvmChain, defaultEvmCurrencyOption]);

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
  const formattedCoinbaseBalanceValue = formatDecimalValues(
    selectedCoinbaseCurrencyBalance?.value,
  );

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
    // reset wallet states when user manually enters address
    resetAstriaWalletState();
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

  // check if form is valid whenever values change
  useEffect(() => {
    const anyWalletConnected =
      evmAccountAddress || cosmosAccountAddress || coinbaseAccountAddress;
    if (anyWalletConnected || amount || recipientAddressOverride) {
      // have touched form when any wallet connected or amount/address changed
      setHasTouchedForm(true);
    }
    const recipientAddress = recipientAddressOverride || evmAccountAddress;
    checkIsFormValid(recipientAddress, amount);
  }, [
    evmAccountAddress,
    cosmosAccountAddress,
    coinbaseAccountAddress,
    amount,
    recipientAddressOverride,
  ]);

  const updateAmount = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(event.target.value);
  };

  const checkIsFormValid = (
    addressInput: string | null,
    amountInput: string,
  ) => {
    if (addressInput === null) {
      setIsRecipientAddressValid(false);
      return;
    }
    // check that address is correct evm address format
    if (!addressInput.startsWith("0x")) {
      setIsRecipientAddressValid(false);
      return;
    }

    const amount = Number.parseFloat(amountInput);
    const amountValid = amount > 0;
    setIsAmountValid(amountValid);
    // TODO - what validation should we do?
    const addressValid = addressInput.length > 0;
    setIsRecipientAddressValid(addressValid);
  };

  const handleConnectEvmWallet = useCallback(() => {
    // clear recipient address override values when user attempts to connect evm wallet
    setIsRecipientAddressEditable(false);
    setRecipientAddressOverride("");
    connectEvmWallet();
  }, [connectEvmWallet]);

  // ensure evm wallet connection when selected EVM chain changes
  useEffect(() => {
    if (!selectedEvmChain || selectedSourceType !== SourceType.EVM) {
      return;
    }
    // FIXME - there is a bad implicit loop of logic here.
    //  1. user can click "Connect EVM Wallet", which calls `connectEvmWallet`, before selecting a chain
    //  2. `connectEvmWallet` will set the selected evm chain if it's not set
    //  3. this `useEffect` is then triggered, which ultimately calls `connectEvmWallet`,
    //     but now a chain is set so it will open the connect modal
    console.log("useEffect handle connect evm wallet");
    handleConnectEvmWallet();
  }, [selectedEvmChain, handleConnectEvmWallet, selectedSourceType]);

  const handleDeposit = async () => {
    const activeSourceAddress = getActiveSourceAddress();
    const recipientAddress = recipientAddressOverride || evmAccountAddress;

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
      // Different deposit logic based on source type
      if (selectedSourceType === SourceType.Cosmos) {
        // Cosmos to EVM deposit
        if (!selectedCosmosChain || !selectedIbcCurrency) {
          throw new Error(
            "Please select a Cosmos chain and token to bridge first.",
          );
        }

        const formattedAmount = Decimal.fromUserInput(
          amount,
          selectedIbcCurrency.coinDecimals,
        ).atomics;

        const signer = await getCosmosSigningClient();
        await sendIbcTransfer(
          signer,
          cosmosAccountAddress!,
          recipientAddress,
          formattedAmount,
          selectedIbcCurrency,
        );
      } else if (selectedSourceType === SourceType.Coinbase) {
        // Coinbase to EVM deposit using intent bridge
        if (!selectedCoinbaseChain || !selectedCoinbaseCurrency) {
          throw new Error(
            "Please select a Coinbase chain and token to bridge first.",
          );
        }

        if (!selectedCoinbaseCurrency.astriaIntentBridgeAddress) {
          throw new Error(
            "Intent bridge contract not configured for this token.",
          );
        }

        // Convert amount to the proper format based on decimals
        // FIXME - is this how the math is done in other places?
        const formattedAmount = BigInt(
          Math.floor(
            parseFloat(amount) * 10 ** selectedCoinbaseCurrency.coinDecimals,
          ).toString(),
        );

        // TODO - also need to handle "coinbase onramp" somewhere

        // send money via ERC20 contract
        if (selectedCoinbaseCurrency.erc20ContractAddress) {
          const erc20Service = createErc20Service(
            wagmiConfig,
            selectedCoinbaseCurrency.erc20ContractAddress,
          );
          await erc20Service.transfer({
            recipient: selectedCoinbaseCurrency.astriaIntentBridgeAddress,
            amount: formattedAmount,
            chainId: selectedCoinbaseChain.chainId,
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

  // disable deposit button if form is invalid
  const isDepositDisabled = useMemo<boolean>((): boolean => {
    const activeSourceAddress = getActiveSourceAddress();

    if (recipientAddressOverride) {
      // there won't be a selected destination chain and currency if user manually
      // enters a recipient address
      return !(isAmountValid && isRecipientAddressValid && activeSourceAddress);
    }

    if (selectedSourceType === SourceType.Cosmos) {
      return !(
        evmAccountAddress &&
        isAmountValid &&
        isRecipientAddressValid &&
        cosmosAccountAddress &&
        selectedIbcCurrency?.coinDenom ===
          selectedDestinationCurrencyOption?.value?.coinDenom
      );
    }

    if (selectedSourceType === SourceType.Coinbase) {
      return !(
        evmAccountAddress &&
        isAmountValid &&
        isRecipientAddressValid &&
        coinbaseAccountAddress &&
        selectedCoinbaseCurrency !== null
      );
    }

    return true;
  }, [
    getActiveSourceAddress,
    recipientAddressOverride,
    evmAccountAddress,
    isAmountValid,
    isRecipientAddressValid,
    cosmosAccountAddress,
    coinbaseAccountAddress,
    selectedSourceType,
    selectedIbcCurrency,
    selectedDestinationCurrencyOption,
    selectedCoinbaseCurrency,
  ]);

  const additionalEvmChainOptions = useMemo(() => {
    return [
      {
        label: "Connect EVM Wallet",
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

  return (
    <div>
      <div>
        <div className="flex flex-col">
          <div className="mb-2 sm:hidden">Source</div>
          <div className="flex flex-col sm:flex-row sm:items-center">
            <div className="hidden sm:block sm:mr-4 sm:min-w-[60px]">
              Source
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
                      ? selectedCosmosChainOption
                      : selectedCoinbaseChainOption
                  }
                  LeftIcon={WalletIcon}
                />
              </div>

              {/* Currency selection based on source type */}
              {selectedSourceType === SourceType.Cosmos &&
                selectedCosmosChain &&
                ibcCurrencyOptions && (
                  <div className="w-full sm:w-auto">
                    <Dropdown
                      placeholder="Select a token"
                      options={ibcCurrencyOptions}
                      defaultOption={defaultIbcCurrencyOption}
                      onSelect={selectIbcCurrency}
                      LeftIcon={WalletIcon}
                    />
                  </div>
                )}
              {selectedSourceType === SourceType.Coinbase &&
                selectedCoinbaseChain &&
                coinbaseCurrencyOptions && (
                  <div className="w-full sm:w-auto">
                    <Dropdown
                      placeholder="Select a token"
                      options={coinbaseCurrencyOptions}
                      defaultOption={defaultCoinbaseCurrencyOption}
                      onSelect={selectCoinbaseCurrency}
                      LeftIcon={BaseIcon}
                    />
                  </div>
                )}
            </div>
          </div>

          {/* Source wallet info display based on source type */}
          {selectedSourceType === SourceType.Cosmos && cosmosAccountAddress && (
            <div className="mt-3 bg-grey-dark rounded-xl py-2 px-3">
              <p className="text-grey-light font-semibold">
                {/* TODO - refactor into some kind of `sourceAddress` variable */}
                Address: {shortenAddress(cosmosAccountAddress)}
              </p>
              {selectedIbcCurrency && !isLoadingCosmosBalance && (
                <p className="mt-2 text-grey-lighter font-semibold">
                  {/* TODO - refactor into some kind of `sourceAccountBalance` variable */}
                  Balance: {formattedCosmosBalanceValue} {cosmosBalance?.symbol}
                </p>
              )}
              {isLoadingCosmosBalance && (
                <p className="mt-2 text-grey-lighter font-semibold">
                  Balance: <i className="fas fa-spinner fa-pulse" />
                </p>
              )}
            </div>
          )}

          {selectedSourceType === SourceType.Coinbase &&
            coinbaseAccountAddress && (
              <div className="mt-3 bg-grey-dark rounded-xl py-2 px-3">
                <p className="text-grey-light font-semibold">
                  Address: {shortenAddress(coinbaseAccountAddress)}
                </p>
                {selectedCoinbaseCurrency &&
                  !isLoadingSelectedCoinbaseCurrencyBalance && (
                    <p className="mt-2 text-grey-lighter font-semibold">
                      Balance: {formattedCoinbaseBalanceValue}{" "}
                      {selectedCoinbaseCurrencyBalance?.symbol}
                    </p>
                  )}
                {isLoadingSelectedCoinbaseCurrencyBalance && (
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
            <div className="hidden sm:block sm:mr-4 sm:min-w-[60px]">To</div>
            <div className="flex flex-col sm:flex-row w-full gap-3">
              <div className="grow">
                <Dropdown
                  placeholder="Connect Astria wallet or enter address"
                  options={evmChainsOptions}
                  onSelect={selectEvmChain}
                  additionalOptions={additionalEvmChainOptions}
                  valueOverride={selectedEvmChainOption}
                  LeftIcon={WalletIcon}
                />
              </div>
              {selectedEvmChain && evmCurrencyOptions && (
                <div className="w-full sm:w-auto">
                  <Dropdown
                    placeholder="No matching token"
                    options={evmCurrencyOptions}
                    defaultOption={defaultEvmCurrencyOption}
                    onSelect={selectEvmCurrency}
                    valueOverride={selectedDestinationCurrencyOption}
                    disabled={true}
                  />
                </div>
              )}
            </div>
          </div>
          {evmAccountAddress &&
            !isRecipientAddressEditable &&
            !recipientAddressOverride && (
              <div className="mt-3 rounded-xl p-4 transition border border-solid border-transparent bg-semi-white hover:border-grey-medium">
                {evmAccountAddress && (
                  <p
                    className="text-grey-light font-semibold cursor-pointer"
                    onKeyDown={handleEditRecipientClick}
                    onClick={handleEditRecipientClick}
                  >
                    <span className="mr-2">
                      Address: {shortenAddress(evmAccountAddress)}
                    </span>
                    <i className="fas fa-pen-to-square" />
                  </p>
                )}
                {evmAccountAddress &&
                  selectedEvmChain &&
                  !isLoadingSelectedEvmCurrencyBalance && (
                    <p className="mt-2 text-grey-lighter font-semibold">
                      Balance: {formattedEvmBalanceValue}{" "}
                      {selectedEvmCurrencyBalance?.symbol}
                    </p>
                  )}
                {evmAccountAddress && isLoadingSelectedEvmCurrencyBalance && (
                  <p className="mt-2 text-grey-lighter font-semibold">
                    Balance: <i className="fas fa-spinner fa-pulse" />
                  </p>
                )}
                {selectedDestinationCurrencyOption?.value
                  ?.erc20ContractAddress &&
                  evmAccountAddress && (
                    <div className="mt-3">
                      <AddErc20ToWalletButton
                        evmCurrency={selectedDestinationCurrencyOption.value}
                      />
                    </div>
                  )}
              </div>
            )}
          {recipientAddressOverride && !isRecipientAddressEditable && (
            <div className="field-info-box mt-3 py-2 px-3">
              <p
                className="has-text-grey-light has-text-weight-semibold is-clickable"
                onKeyDown={handleEditRecipientClick}
                onClick={handleEditRecipientClick}
              >
                <span className="mr-2">
                  Address: {recipientAddressOverride}
                </span>
                <i className="fas fa-pen-to-square" />
              </p>
              {!isRecipientAddressValid && hasTouchedForm && (
                <div className="help is-danger mt-2">
                  Recipient address must be a valid EVM address
                </div>
              )}
              <p className="mt-2 has-text-grey-lighter has-text-weight-semibold is-size-7">
                Connect via wallet to show balance
              </p>
            </div>
          )}
          {isRecipientAddressEditable && (
            <div className="field-info-box mt-3 py-2 px-3">
              <div className="has-text-grey-light has-text-weight-semibold">
                <input
                  className="input is-medium is-outlined-white"
                  type="text"
                  placeholder="0x..."
                  onChange={updateRecipientAddressOverride}
                  value={recipientAddressOverride}
                />
                <button
                  type="button"
                  className="button is-ghost is-outlined-white mr-2 mt-2"
                  onClick={handleEditRecipientSave}
                >
                  Save
                </button>
                <button
                  type="button"
                  className="button is-ghost is-outlined-white mt-2"
                  onClick={handleEditRecipientClear}
                >
                  Clear
                </button>
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
  );
}
