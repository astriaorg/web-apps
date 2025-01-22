import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { CopyToClipboardButton } from "@repo/ui/components";
import { useCosmosWallet } from "../../hooks/useCosmosWallet";
import { shortenAddress } from "../../../../utils/utils";
import { CosmosIcon, PowerIcon, UpRightSquareIcon } from "@repo/ui/icons";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@repo/ui/shadcn-primitives";

interface ConnectCosmosWalletButtonProps {
  // Label to show before the user is connected to a wallet.
  labelBeforeConnected?: string;
}

/**
 * Button with information dropdown to connect to a Cosmos wallet.
 */
export default function ConnectCosmosWalletButton({
  labelBeforeConnected,
}: ConnectCosmosWalletButtonProps) {
  const {
    connectCosmosWallet,
    cosmosAccountAddress,
    cosmosBalance,
    disconnectCosmosWallet,
    isLoadingCosmosBalance,
  } = useCosmosWallet();

  // information dropdown
  const [isDropdownActive, setIsDropdownActive] = useState(false);
  // const [showTransactions, setShowTransactions] = useState(false);
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
    if (cosmosAccountAddress) {
      return shortenAddress(cosmosAccountAddress);
    }
    return labelBeforeConnected ?? "Connect";
  }, [labelBeforeConnected, cosmosAccountAddress]);

  // connect to wallet or show information dropdown
  const handleConnectWallet = useCallback(() => {
    if (!cosmosAccountAddress) {
      connectCosmosWallet();
    }
    if (cosmosAccountAddress) {
      // if user is already connected, open information dropdown
      toggleDropdown();
    }
  }, [connectCosmosWallet, toggleDropdown, cosmosAccountAddress]);

  const handleDisconnectWallet = useCallback(() => {
    const disconnect = async () => {
      await disconnectCosmosWallet();
    };

    disconnect().then(() => {});
  }, [disconnectCosmosWallet]);

  return cosmosAccountAddress ? (
    <Accordion type="single" collapsible>
      <AccordionItem
        value="transaction-details"
        className="text-grey-light text-sm border-b-0"
      >
        <div className="flex items-center justify-between w-full md:w-[300px]">
          <AccordionTrigger className="flex items-center gap-2 w-[162px]">
            {cosmosAccountAddress && <CosmosIcon />}
            <span className="text-white text-base font-normal">{label}</span>
          </AccordionTrigger>
          <div className="flex items-center gap-3">
            <CopyToClipboardButton textToCopy={cosmosAccountAddress} />
            <UpRightSquareIcon
              className="cursor-pointer hover:text-white transition"
              size={21}
            />
            <button type="button" onClick={() => handleDisconnectWallet()}>
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
              {isLoadingCosmosBalance && <div>Loading...</div>}
              {!isLoadingCosmosBalance && cosmosBalance && (
                <div className="text-[20px] mb-2 font-bold">
                  {cosmosBalance}
                </div>
              )}
              {/* TODO - price in USD */}
              <div>$0.00 USD</div>
            </div>

            {/* Transactions Section - TODO */}
            {/* <div>
              <button
                type="button"
                onClick={() => setShowTransactions(!showTransactions)}
              >
                <span>Transactions</span>
                <ChevronDownIcon className="rotate-[270deg]"/>
              </button>

              {showTransactions && (
                <div>
                  <div>No recent transactions</div>
                </div>
              )}
            </div> */}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ) : (
    <button
      type="button"
      key="connect-cosmos-wallet-button"
      onClick={handleConnectWallet}
      className="flex items-center gap-2 py-4 w-full md:w-[300px]"
    >
      <CosmosIcon />
      <span>{label}</span>
    </button>
  );
}
