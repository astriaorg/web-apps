import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { CopyToClipboardButton, Skeleton } from "@repo/ui/components";
import { formatDecimalValues, shortenAddress } from "@repo/ui/utils";
import { useCoinbaseWallet } from "features/coinbase-wallet";
import { BaseIcon, PowerIcon, UpRightSquareIcon } from "@repo/ui/icons";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@repo/ui/components";

interface ConnectCoinbaseWalletButtonProps {
  // Label to show before the user is connected to a wallet.
  labelBeforeConnected?: string;
}

/**
 * Button with information dropdown to connect to a Coinbase wallet.
 */
export default function ConnectCoinbaseWalletButton({
  labelBeforeConnected,
}: ConnectCoinbaseWalletButtonProps) {
  const {
    coinbaseAccountAddress,
    connectCoinbaseWallet,
    disconnectCoinbaseWallet,
    coinbaseNativeTokenBalance,
    isLoadingCoinbaseNativeTokenBalance,
  } = useCoinbaseWallet();

  const formattedCoinbaseBalanceValue = formatDecimalValues(
    coinbaseNativeTokenBalance?.value,
  );

  // information dropdown
  const [isDropdownActive, setIsDropdownActive] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const toggleDropdown = useCallback(() => {
    setIsDropdownActive(!isDropdownActive);
  }, [isDropdownActive]);

  // handle clicking outside dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownActive(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // ui
  const label = useMemo(() => {
    if (coinbaseAccountAddress) {
      return shortenAddress(coinbaseAccountAddress);
    }
    return labelBeforeConnected ?? "Connect";
  }, [labelBeforeConnected, coinbaseAccountAddress]);

  // connect to wallet or show information dropdown
  const handleConnectWallet = useCallback(() => {
    if (!coinbaseAccountAddress) {
      connectCoinbaseWallet();
    }
    if (coinbaseAccountAddress) {
      // if user is already connected, open information dropdown
      toggleDropdown();
    }
  }, [connectCoinbaseWallet, toggleDropdown, coinbaseAccountAddress]);

  return coinbaseAccountAddress ? (
    <Accordion type="single" collapsible>
      <AccordionItem
        value="transaction-details"
        className="text-grey-light text-sm border-b-0"
      >
        <div className="flex items-center justify-between w-full md:w-[300px]">
          <AccordionTrigger className="flex items-center gap-2 w-[162px]">
            {coinbaseAccountAddress && <BaseIcon />}
            <span className="text-white text-base font-normal">{label}</span>
          </AccordionTrigger>
          <div className="flex items-center gap-3">
            <CopyToClipboardButton textToCopy={coinbaseAccountAddress} />
            <UpRightSquareIcon
              className="cursor-pointer hover:text-white transition"
              size={21}
            />
            <button type="button" onClick={disconnectCoinbaseWallet}>
              <PowerIcon
                className="cursor-pointer hover:text-white transition"
                size={21}
              />
            </button>
          </div>
        </div>
        <AccordionContent>
          <div className="text-white ml-8">
            <div>
              <Skeleton
                className="w-[150px] h-[20px] mb-2"
                isLoading={
                  isLoadingCoinbaseNativeTokenBalance ||
                  !coinbaseNativeTokenBalance
                }
              >
                <div className="text-[20px] mb-2 font-bold flex items-center gap-2">
                  <span>{formattedCoinbaseBalanceValue}</span>
                  <span>{coinbaseNativeTokenBalance?.symbol}</span>
                </div>
              </Skeleton>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ) : (
    <button
      type="button"
      key="connect-coinbase-wallet-button"
      onClick={handleConnectWallet}
      className="flex items-center gap-2 py-4 w-full md:w-[300px] cursor-pointer"
    >
      <BaseIcon />
      <span>{label}</span>
    </button>
  );
}
