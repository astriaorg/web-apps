"use client";

import { Decimal } from "@cosmjs/math";
import type React from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button, Dropdown } from "@repo/ui/components";
import { sendIbcTransfer, useCosmosWallet } from "features/cosmos-wallet";
import { AddErc20ToWalletButton, useEvmWallet } from "features/evm-wallet";
import { NotificationType, useNotifications } from "features/notifications";
import { AnimatedArrowSpacer } from "@repo/ui/components";
import {
  ArrowUpDownIcon,
  EditIcon,
  PlusIcon,
  WalletIcon,
} from "@repo/ui/icons";
import { formatDecimalValues, shortenAddress } from "@repo/ui/utils";

export default function DepositCard(): React.ReactElement {
  const { addNotification } = useNotifications();

  const {
    evmAccountAddress,
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
    resetState: resetEvmWalletState,
  } = useEvmWallet();

  const {
    cosmosAccountAddress: fromAddress,
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
  } = useCosmosWallet();

  // ensure cosmos wallet connection when selected ibc chain changes
  useEffect(() => {
    if (!selectedCosmosChain) {
      return;
    }
    connectCosmosWallet();
  }, [selectedCosmosChain, connectCosmosWallet]);

  // the evm currency selection is controlled by the sender's chosen ibc currency,
  // and should be updated when an ibc currency or evm chain is selected
  const selectedEvmCurrencyOption = useMemo(() => {
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
    // reset evmWalletState when user manually enters address
    resetEvmWalletState();
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
    if (evmAccountAddress || amount || recipientAddressOverride) {
      // have touched form when evmAccountAddress or amount change
      setHasTouchedForm(true);
    }
    const recipientAddress = recipientAddressOverride || evmAccountAddress;
    checkIsFormValid(recipientAddress, amount);
  }, [evmAccountAddress, amount, recipientAddressOverride]);

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
    if (!selectedEvmChain) {
      return;
    }
    // FIXME - there is a bad implicit loop of logic here.
    //  1. user can click "Connect EVM Wallet", which calls `connectEvmWallet`, before selecting a chain
    //  2. `connectEvmWallet` will set the selected evm chain if it's not set
    //  3. this `useEffect` is then triggered, which ultimately calls `connectEvmWallet`,
    //     but now a chain is set so it will open the connect modal
    console.log("useEffect handle connect evm wallet");
    handleConnectEvmWallet();
  }, [selectedEvmChain, handleConnectEvmWallet]);

  const handleDeposit = async () => {
    if (!selectedCosmosChain || !selectedIbcCurrency) {
      addNotification({
        toastOpts: {
          toastType: NotificationType.WARNING,
          message: "Please select a chain and token to bridge first.",
          onAcknowledge: () => {},
        },
      });
      return;
    }

    const recipientAddress = recipientAddressOverride || evmAccountAddress;
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

    setIsLoading(true);
    setIsAnimating(true);

    try {
      const formattedAmount = Decimal.fromUserInput(
        amount,
        selectedIbcCurrency.coinDecimals,
      ).atomics;

      const signer = await getCosmosSigningClient();
      await sendIbcTransfer(
        signer,
        fromAddress,
        recipientAddress,
        formattedAmount,
        selectedIbcCurrency,
      );
      addNotification({
        toastOpts: {
          toastType: NotificationType.SUCCESS,
          message: "Deposit successful!",
          onAcknowledge: () => {},
        },
      });
    } catch (e) {
      setIsAnimating(false);
      console.error("IBC transfer failed", e);
      const message = e instanceof Error ? e.message : "Unknown error.";
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
                <p className="mb-1">Failed to send IBC transfer.</p>
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
    if (recipientAddressOverride) {
      // there won't be a selected evm chain and currency if user manually
      // enters a recipient address
      return !(isAmountValid && isRecipientAddressValid && fromAddress);
    }
    return !(
      evmAccountAddress &&
      isAmountValid &&
      isRecipientAddressValid &&
      fromAddress &&
      selectedIbcCurrency?.coinDenom ===
        selectedEvmCurrencyOption?.value?.coinDenom
    );
  }, [
    recipientAddressOverride,
    evmAccountAddress,
    isAmountValid,
    isRecipientAddressValid,
    fromAddress,
    selectedIbcCurrency,
    selectedEvmCurrencyOption,
  ]);

  const additionalIbcChainOptions = useMemo(
    () => [
      {
        label: "Connect Cosmos Wallet",
        action: connectCosmosWallet,
        className: "has-text-primary",
        leftIconClass: "i-cosmos",
        RightIcon: PlusIcon,
      },
    ],
    [connectCosmosWallet],
  );

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
          <div className="mb-2 sm:hidden">From</div>
          <div className="flex flex-col sm:flex-row sm:items-center">
            <div className="hidden sm:block sm:mr-4 sm:min-w-[60px]">From</div>
            <div className="flex flex-col sm:flex-row w-full gap-3">
              <div className="grow">
                <Dropdown
                  placeholder="Select..."
                  options={cosmosChainsOptions}
                  onSelect={selectCosmosChain}
                  additionalOptions={additionalIbcChainOptions}
                  valueOverride={selectedCosmosChainOption}
                  LeftIcon={WalletIcon}
                />
              </div>
              {selectedCosmosChain && ibcCurrencyOptions && (
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
            </div>
          </div>
          {fromAddress && (
            <div className="mt-3 bg-grey-dark rounded-xl py-2 px-3">
              {fromAddress && (
                <p className="text-grey-light font-semibold">
                  Address: {shortenAddress(fromAddress)}
                </p>
              )}
              {fromAddress &&
                selectedIbcCurrency &&
                !isLoadingCosmosBalance && (
                  <p className="mt-2 text-grey-lighter font-semibold">
                    Balance: {formattedCosmosBalanceValue}{" "}
                    {cosmosBalance?.symbol}
                  </p>
                )}
              {fromAddress && isLoadingCosmosBalance && (
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
                  placeholder="Connect EVM Wallet or enter address"
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
                    valueOverride={selectedEvmCurrencyOption}
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
                {selectedEvmCurrencyOption?.value?.erc20ContractAddress &&
                  evmAccountAddress && (
                    <div className="mt-3">
                      <AddErc20ToWalletButton
                        evmCurrency={selectedEvmCurrencyOption.value}
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
        <Button onClick={handleDeposit} disabled={isDepositDisabled}>
          {isLoading ? "Processing..." : "Deposit"}
        </Button>
      </div>
    </div>
  );
}
