"use client";

import Big from "big.js";
import Link from "next/link";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useSwitchChain } from "wagmi";

import { ChainType, EvmCurrency } from "@repo/flame-types";
import {
  AnimatedArrowSpacer,
  Button,
  Card,
  CardContent,
  Input,
  Skeleton,
} from "@repo/ui/components";
import { ArrowDownIcon, EditIcon, WalletIcon } from "@repo/ui/icons";
import { shortenAddress } from "@repo/ui/utils";
import { AmountInput } from "bridge/components/amount-input";
import { ManageWalletsButton } from "bridge/components/manage-wallets-button";
import { SubmitButton } from "bridge/components/submit-button";
import { ROUTES } from "bridge/constants/routes";
import { useBridgeConnections } from "bridge/hooks/use-bridge-connections";
import { useBridgeOptions } from "bridge/hooks/use-bridge-options";
import { useWithdrawTransaction } from "bridge/modules/withdraw/hooks/use-withdraw-transaction";
import { Dropdown } from "components/dropdown";
import { SwapButton } from "components/swap-button";
import { useConfig } from "config";
import { AddErc20ToWalletButton } from "features/evm-wallet";
import { NotificationType, useNotifications } from "features/notifications";
import { useCurrencyBalance } from "hooks/use-currency-balance";

export const ContentSection = () => {
  const { addNotification } = useNotifications();
  const { switchChain } = useSwitchChain();

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

  const { astriaChains, cosmosChains } = useConfig();

  const {
    sourceChainOptions,
    destinationChainOptions,
    getSourceCurrencyOptions,
    getDestinationCurrencyOptions,
    findMatchingDestinationCurrency,
  } = useBridgeOptions({
    sourceChains: Object.values(astriaChains),
    destinationChains: Object.values(cosmosChains),
    mode: "withdraw",
  });

  // without these in combination with Dropdown's valueOverride,
  // we would not be able to clear the selection
  const sourceChainOption = useMemo(() => {
    if (!sourceConnection.chain) {
      return null;
    }
    return {
      label: sourceConnection.chain.chainName,
      value: sourceConnection.chain,
      LeftIcon: sourceConnection.chain.IconComponent,
    };
  }, [sourceConnection.chain]);
  const destinationChainOption = useMemo(() => {
    if (!destinationConnection.chain) {
      return null;
    }
    return {
      label: destinationConnection.chain.chainName,
      value: destinationConnection.chain,
      LeftIcon: destinationConnection.chain.IconComponent,
    };
  }, [destinationConnection.chain]);

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

    if (
      sourceConnection.chain?.chainType === ChainType.EVM ||
      sourceConnection.chain?.chainType === ChainType.ASTRIA
    ) {
      switchChain({ chainId: sourceConnection.chain.chainId });
    }

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
    sourceConnection,
    switchChain,
    executeWithdraw,
    amount,
    destinationConnection,
    recipientAddressOverride,
    addNotification,
  ]);

  // additional options for destination chains
  const additionalDestinationOptions = useMemo(() => {
    return [
      {
        label: "Enter Address Manually",
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
  const sourceCurrencyOption = useMemo(
    () =>
      findMatchingDestinationCurrency(
        destinationConnection.chain,
        destinationConnection.currency,
        sourceConnection.chain,
      ) || defaultSourceCurrencyOption,
    [
      findMatchingDestinationCurrency,
      destinationConnection.chain,
      destinationConnection.currency,
      sourceConnection.chain,
      defaultSourceCurrencyOption,
    ],
  );

  const checkIsFormValid = useCallback(
    (addressInput: string | null, amountInput: string) => {
      // check that we have an address and it is correct format
      if (addressInput === null || addressInput.length < 0) {
        setIsRecipientAddressValid(false);
      } else {
        const addressValid = addressInput.length > 0;
        setIsRecipientAddressValid(addressValid);
      }

      // Handle edge cases before passing to Big.js
      if (!amountInput || amountInput === "." || amountInput === "0") {
        setIsAmountValid(false);
        return;
      }

      try {
        const amount = new Big(amountInput);
        const amountValid = amount.gt(0);
        setIsAmountValid(amountValid);
      } catch {
        setIsAmountValid(false);
      }
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
    useCurrencyBalance(sourceConnection.currency ?? undefined, {
      enabled: sourceConnection.isConnected,
    });

  // Get destination token balance
  const {
    balance: destinationBalance,
    isLoading: isLoadingDestinationBalance,
  } = useCurrencyBalance(destinationConnection.currency ?? undefined, {
    enabled: destinationConnection.isConnected,
  });

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

  return (
    <div className="flex flex-col items-center w-full">
      <div className="flex self-end mb-4">
        <ManageWalletsButton />
      </div>
      <div className="w-full">
        <div>
          <div>
            <div className="flex flex-col">
              <Card
                variant="secondary"
                className="flex flex-col px-6 py-10 gap-2 sm:flex-row sm:items-center"
              >
                <div className="sm:mr-4 sm:min-w-[60px]">From</div>
                <div className="flex flex-col sm:flex-row w-full gap-3">
                  <div className="grow">
                    <Dropdown
                      placeholder="Select source..."
                      options={sourceChainOptions}
                      onSelect={connectSource}
                      valueOverride={sourceChainOption}
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
                        valueOverride={sourceCurrencyOption}
                        LeftIcon={WalletIcon}
                      />
                    </div>
                  )}
                </div>
              </Card>
              {/* Source wallet info */}
              {sourceConnection.address && (
                <Card variant="secondary" className="mt-3 p-6">
                  <p className="text-sm text-typography-light">
                    Address: {shortenAddress(sourceConnection.address)}
                  </p>
                  {sourceConnection.currency &&
                    sourceConnection.isConnected && (
                      <div className="flex mt-2 text-sm text-typography-subdued">
                        Balance:&nbsp;
                        {isLoadingSourceBalance && (
                          <Skeleton className="w-32 h-5" />
                        )}
                        {!isLoadingSourceBalance &&
                          sourceBalance &&
                          `${sourceBalance.value} ${sourceBalance.symbol}`}
                        {!isLoadingSourceBalance &&
                          !sourceBalance &&
                          `0 ${sourceConnection.currency.coinDenom}`}
                      </div>
                    )}
                  {sourceConnection.currency instanceof EvmCurrency &&
                    !isLoadingSourceBalance &&
                    (!sourceBalance || sourceBalance.value === "0") && (
                      <div className="mt-3">
                        <AddErc20ToWalletButton
                          evmCurrency={sourceConnection.currency}
                        />
                      </div>
                    )}
                </Card>
              )}
            </div>
          </div>

          {isAnimating ? (
            <AnimatedArrowSpacer isAnimating={isAnimating} />
          ) : (
            <Link href={ROUTES.DEPOSIT}>
              <SwapButton
                icon={<ArrowDownIcon />}
                className="pointer-events-none"
              />
            </Link>
          )}

          <div className="mb-4">
            <div className="flex flex-col">
              <Card
                variant="secondary"
                className="flex flex-col px-6 py-10 gap-2 sm:flex-row sm:items-center"
              >
                <div className="sm:mr-4 sm:min-w-[60px]">To</div>
                <div className="flex flex-col sm:flex-row w-full gap-3">
                  <div className="grow">
                    <Dropdown
                      placeholder="Select destination..."
                      options={destinationChainOptions}
                      onSelect={connectDestination}
                      valueOverride={destinationChainOption}
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
              </Card>

              {/* Destination address display - when using wallet address */}
              {destinationConnection.address &&
                !isRecipientAddressEditable &&
                !recipientAddressOverride && (
                  <Card variant="secondary" className="mt-3 p-6">
                    <p
                      className="flex items-center text-sm text-typography-light cursor-pointer"
                      onClick={handleEditRecipientClick}
                    >
                      <span className="mr-2">
                        Address: {shortenAddress(destinationConnection.address)}
                      </span>
                      <EditIcon className="inline-block ml-1" size={16} />
                    </p>
                    {destinationConnection.currency &&
                      destinationConnection.isConnected && (
                        <div className="flex mt-2 text-sm text-typography-subdued">
                          Balance:&nbsp;
                          {isLoadingDestinationBalance && (
                            <Skeleton className="w-32 h-5" />
                          )}
                          {!isLoadingDestinationBalance &&
                            destinationBalance &&
                            `${destinationBalance.value} ${destinationBalance.symbol}`}
                          {!isLoadingDestinationBalance &&
                            !destinationBalance &&
                            `0 ${destinationConnection.currency.coinDenom}`}
                        </div>
                      )}
                  </Card>
                )}

              {/* Destination address display - when using manual address */}
              {recipientAddressOverride && !isRecipientAddressEditable && (
                <Card
                  variant="secondary"
                  className="mt-3 p-6 border border-transparent hover:border-stroke-default"
                >
                  <p
                    className="flex items-center text-sm text-typography-light cursor-pointer"
                    onClick={handleEditRecipientClick}
                  >
                    <span className="mr-2">
                      Address: {shortenAddress(recipientAddressOverride)}
                    </span>
                    <EditIcon className="inline-block ml-1" size={16} />
                  </p>
                  {!isRecipientAddressValid && hasTouchedForm && (
                    <div className="mt-2 text-danger text-xs">
                      Recipient address must be a valid address.
                    </div>
                  )}
                  <p className="mt-2 text-typography-subdued text-xs">
                    Connect wallet to show balance.
                  </p>
                </Card>
              )}

              {/* Address input form when editing */}
              {isRecipientAddressEditable && (
                <Card variant="secondary" className="mt-3">
                  <CardContent>
                    <Input
                      type="text"
                      placeholder="Enter Address"
                      onChange={updateRecipientAddressOverride}
                      value={recipientAddressOverride}
                    />
                    <div className="mt-3 flex space-x-2">
                      <Button
                        size="sm"
                        className="min-w-24"
                        onClick={handleEditRecipientSave}
                      >
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        className="min-w-24"
                        onClick={handleEditRecipientClear}
                      >
                        Clear
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          <AmountInput
            amount={amount}
            setAmount={setAmount}
            isAmountValid={isAmountValid}
            hasTouchedForm={hasTouchedForm}
          />

          <SubmitButton
            onClick={handleWithdrawClick}
            isLoading={isLoading}
            isDisabled={isWithdrawDisabled || !sourceConnection.address}
            buttonText="Withdraw"
            sourceConnection={sourceConnection}
            amountInput={amount}
          />
        </div>
      </div>
    </div>
  );
};
