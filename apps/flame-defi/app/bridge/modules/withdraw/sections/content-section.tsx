"use client";

import Big from "big.js";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { formatUnits } from "viem";

import { EvmCurrency } from "@repo/flame-types";
import { AnimatedArrowSpacer, Button } from "@repo/ui/components";
import { ArrowUpDownIcon, EditIcon, WalletIcon } from "@repo/ui/icons";
import { shortenAddress } from "@repo/ui/utils";
import { Dropdown } from "components/dropdown";
import { useConfig } from "config";
import { NotificationType, useNotifications } from "features/notifications";

import { BridgeConnectionsModal } from "bridge/components/bridge-connections-modal";
import { useCurrencyBalance } from "bridge/hooks/use-currency-balance";
import { useWithdrawTransaction } from "bridge/modules/withdraw/hooks/use-withdraw-transaction";
import { useBridgeConnections } from "bridge/hooks/use-bridge-connections";
import { useBridgeOptions } from "bridge/hooks/use-bridge-options";

export const ContentSection = () => {
  const { addNotification } = useNotifications();

  // Local state for form
  const [amount, setAmount] = useState<string>("");
  const [isAmountValid, setIsAmountValid] = useState<boolean>(false);
  const [hasTouchedForm, setHasTouchedForm] = useState<boolean>(false);

  // Local state for recipient address management
  const [recipientAddressOverride, setRecipientAddressOverride] = useState<
    string | undefined
  >(undefined);
  const [isRecipientAddressEditable, setIsRecipientAddressEditable] =
    useState<boolean>(false);
  const [isRecipientAddressValid, setIsRecipientAddressValid] =
    useState<boolean>(false);

  const {
    connectSource,
    connectDestination,
    setSourceCurrency,
    setDestinationCurrency,
    sourceConnection,
    destinationConnection,
  } = useBridgeConnections();

  const { isLoading, executeWithdraw } = useWithdrawTransaction();
  const [isAnimating, setIsAnimating] = useState<boolean>(false);

  const { astriaChains, cosmosChains, coinbaseChains } = useConfig();

  const {
    sourceChainOptions,
    destinationChainOptions,
    getSourceCurrencyOptions,
    getDestinationCurrencyOptions,
    findMatchingDestinationCurrency,
  } = useBridgeOptions({
    sourceChains: [...Object.values(astriaChains)],
    destinationChains: [
      ...Object.values(coinbaseChains),
      ...Object.values(cosmosChains),
    ],
  });

  // Recipient address editing handlers
  const handleEditRecipientClick = useCallback(() => {
    setIsRecipientAddressEditable(true);
  }, []);

  const handleEditRecipientSave = useCallback(() => {
    setIsRecipientAddressEditable(false);
  }, []);

  const handleEditRecipientClear = useCallback(() => {
    setIsRecipientAddressEditable(false);
    setRecipientAddressOverride(undefined);
  }, []);

  const handleWithdrawClick = useCallback(async () => {
    setIsAnimating(true);

    try {
      await executeWithdraw({
        amount,
        sourceConnection,
        destinationConnection,
        recipientAddressOverride,
      });

      // Success notification
      addNotification({
        toastOpts: {
          toastType: NotificationType.SUCCESS,
          message: "Withdrawal successful!",
          onAcknowledge: () => {},
        },
      });

      // keep animation for a bit after success
      setTimeout(() => setIsAnimating(false), 1000);
    } catch (error) {
      if (error instanceof Error) {
        addNotification({
          toastOpts: {
            toastType: NotificationType.DANGER,
            component: (
              <>
                <p className="mb-1">Withdrawal failed.</p>
                <p className="message-body-inner">{error.message}</p>
              </>
            ),
            onAcknowledge: () => {},
          },
        });
      } else {
        addNotification({
          toastOpts: {
            toastType: NotificationType.DANGER,
            message: "Failed withdrawal. An unknown error occurred.",
            onAcknowledge: () => {},
          },
        });
      }
      setIsAnimating(false);
    }
  }, [
    amount,
    executeWithdraw,
    sourceConnection,
    destinationConnection,
    recipientAddressOverride,
    addNotification,
  ]);

  // additional options for destination chains
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

  const sourceCurrencyOptions = useMemo(
    () => getSourceCurrencyOptions(sourceConnection.chain),
    [getSourceCurrencyOptions, sourceConnection.chain],
  );
  const defaultSourceCurrencyOption = sourceCurrencyOptions[0];
  const destinationCurrencyOptions = useMemo(
    () => getDestinationCurrencyOptions(destinationConnection.chain),
    [getDestinationCurrencyOptions, destinationConnection.chain],
  );
  const defaultDestinationCurrencyOption = destinationCurrencyOptions[0];

  // find matching destination currency
  const destinationCurrencyOption = useMemo(
    () =>
      findMatchingDestinationCurrency(
        sourceConnection.chain,
        sourceConnection.currency,
        destinationConnection.chain,
      ) || defaultDestinationCurrencyOption,
    [
      findMatchingDestinationCurrency,
      sourceConnection.chain,
      sourceConnection.currency,
      destinationConnection.chain,
      defaultDestinationCurrencyOption,
    ],
  );

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

      const addressValid = addressInput.length > 0;
      setIsRecipientAddressValid(addressValid);

      const amount = new Big(amountInput || "0");
      const amountValid = amount.gt(0);
      setIsAmountValid(amountValid);
    },
    [setIsAmountValid, setIsRecipientAddressValid],
  );

  // Check if form is valid whenever values change
  useEffect(() => {
    // Mark form as touched when any values change or wallet connects
    if (sourceConnection.address || amount || recipientAddressOverride) {
      setHasTouchedForm(true);
    }

    // Use the recipient address from either override or destination chain
    const recipientAddress =
      recipientAddressOverride || destinationConnection.address;
    checkIsFormValid(recipientAddress, amount);
  }, [
    sourceConnection.address,
    destinationConnection.address,
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

  // Get source token balance
  const { balance: sourceBalance, isLoading: isLoadingSourceBalance } =
    useCurrencyBalance(sourceConnection.currency ?? undefined);

  // Get destination token balance
  const {
    balance: destinationBalance,
    isLoading: isLoadingDestinationBalance,
  } = useCurrencyBalance(destinationConnection.currency ?? undefined);

  const isWithdrawDisabled = useMemo<boolean>((): boolean => {
    if (recipientAddressOverride) {
      return !(isAmountValid && isRecipientAddressValid);
    }

    return !(
      isAmountValid &&
      isRecipientAddressValid &&
      sourceConnection.address &&
      sourceConnection.currency?.coinDenom ===
        destinationConnection.currency?.coinDenom
    );
  }, [
    destinationConnection.currency?.coinDenom,
    isAmountValid,
    isRecipientAddressValid,
    recipientAddressOverride,
    sourceConnection.address,
    sourceConnection.currency?.coinDenom,
  ]);

  const destinationChainNativeToken = useMemo(() => {
    return destinationConnection.chain?.currencies.find(
      (currency) => currency.isNative,
    );
  }, [destinationConnection]);

  const ibcWithdrawFeeDisplay = useMemo(() => {
    if (
      !destinationChainNativeToken ||
      !destinationConnection.currency ||
      !(
        destinationConnection.currency instanceof EvmCurrency &&
        destinationConnection.currency?.ibcWithdrawalFeeWei
      )
    ) {
      return "";
    }

    const fee = formatUnits(
      BigInt(destinationConnection.currency.ibcWithdrawalFeeWei),
      destinationChainNativeToken.coinDecimals,
    );
    return `${fee} ${destinationChainNativeToken.coinDenom}`;
  }, [destinationChainNativeToken, destinationConnection.currency]);

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
                      placeholder="Select Astria chain..."
                      options={sourceChainOptions}
                      onSelect={connectSource}
                      LeftIcon={WalletIcon}
                    />
                  </div>

                  {sourceConnection.chain && (
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

              {/* Source wallet info */}
              {sourceConnection.address && (
                <div className="mt-3 bg-grey-dark rounded-xl py-2 px-3">
                  <p className="text-grey-light font-semibold">
                    Address: {shortenAddress(sourceConnection.address)}
                  </p>
                  {sourceConnection.currency && (
                    <p className="mt-2 text-grey-lighter font-semibold">
                      Balance: {isLoadingSourceBalance && "Loading..."}
                      {!isLoadingSourceBalance &&
                        sourceBalance &&
                        `${sourceBalance.value} ${sourceBalance.symbol}`}
                      {!isLoadingSourceBalance &&
                        !sourceBalance &&
                        `0 ${sourceConnection.currency.coinDenom}`}
                    </p>
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
                      placeholder="Connect wallet or enter address"
                      options={destinationChainOptions}
                      onSelect={connectDestination}
                      additionalOptions={additionalDestinationOptions}
                      LeftIcon={WalletIcon}
                    />
                  </div>
                  {destinationConnection.chain && (
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
              {destinationConnection.address &&
                !isRecipientAddressEditable &&
                !recipientAddressOverride && (
                  <div className="mt-3 bg-grey-dark rounded-xl py-2 px-3">
                    <p
                      className="text-grey-light font-semibold cursor-pointer"
                      onClick={handleEditRecipientClick}
                    >
                      <span className="mr-2">
                        Address: {shortenAddress(destinationConnection.address)}
                      </span>
                      <i className="fas fa-pen-to-square" />
                    </p>
                    {destinationConnection.currency && (
                      <p className="mt-2 text-grey-lighter font-semibold">
                        Balance: {isLoadingDestinationBalance && "Loading..."}
                        {!isLoadingDestinationBalance &&
                          destinationBalance &&
                          `${destinationBalance.value} ${destinationBalance.symbol}`}
                        {!isLoadingDestinationBalance &&
                          !destinationBalance &&
                          `0 ${destinationConnection.currency.coinDenom}`}
                      </p>
                    )}
                    {/* Withdrawal fee display */}
                    <div className="mt-2 text-grey-light text-sm">
                      Withdrawal fee: {ibcWithdrawFeeDisplay}
                    </div>
                  </div>
                )}

              {/* Destination address display - when using manual address */}
              {recipientAddressOverride && !isRecipientAddressEditable && (
                <div className="mt-3 bg-grey-dark rounded-xl py-2 px-3">
                  <p
                    className="text-grey-light font-semibold cursor-pointer"
                    onClick={handleEditRecipientClick}
                  >
                    <span className="mr-2">
                      Address: {shortenAddress(recipientAddressOverride)}
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

              {/* Address input form when editing */}
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
            {!sourceConnection.address ? (
              <BridgeConnectionsModal>
                <Button variant="gradient">Connect Wallet</Button>
              </BridgeConnectionsModal>
            ) : (
              <Button
                variant="gradient"
                onClick={handleWithdrawClick}
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
