import React, { useCallback, useMemo } from "react";
import { useAccount } from "wagmi";

import { CopyToClipboardButton, Skeleton } from "@repo/ui/components";

import { useEvmWallet } from "../../hooks/use-evm-wallet";
import { formatDecimalValues, shortenAddress } from "@repo/ui/utils";
import { FlameIcon, PowerIcon, UpRightSquareIcon } from "@repo/ui/icons";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@repo/ui/shadcn-primitives";
import { useEvmChainData } from "config";

interface ConnectEvmWalletButtonProps {
  // Label to show before the user is connected to a wallet.
  labelBeforeConnected?: string;
}

/**
 * Button with information dropdown to connect to an EVM wallet.
 */
export default function ConnectEvmWalletButton({
  labelBeforeConnected,
}: ConnectEvmWalletButtonProps) {
  const { selectedChain } = useEvmChainData();
  const {
    connectEvmWallet,
    disconnectEvmWallet,
    evmNativeTokenBalance,
    isLoadingEvmNativeTokenBalance,
    usdcToNativeQuote,
  } = useEvmWallet();
  const userAccount = useAccount();
  const formattedEvmBalanceValue = formatDecimalValues(
    evmNativeTokenBalance?.value,
  );
  // const [showTransactions, setShowTransactions] = useState(false);

  // ui
  const label = useMemo(() => {
    if (userAccount?.address) {
      return shortenAddress(userAccount.address);
    }
    return labelBeforeConnected ?? "Connect";
  }, [labelBeforeConnected, userAccount?.address]);

  const handleConnectWallet = useCallback(() => {
    connectEvmWallet();
  }, [connectEvmWallet]);

  return userAccount.address ? (
    <Accordion type="single" collapsible>
      <AccordionItem
        value="transaction-details"
        className="text-grey-light text-sm border-b-0"
      >
        <div className="flex items-center justify-between w-full md:w-[300px]">
          <AccordionTrigger className="flex items-center gap-2 w-[162px]">
            {userAccount?.address && <FlameIcon />}
            <span className="text-white text-base font-normal">{label}</span>
          </AccordionTrigger>
          <div className="flex items-center gap-3">
            <CopyToClipboardButton textToCopy={userAccount.address} />
            <a
              href={`${selectedChain.blockExplorerUrl}/address/${userAccount.address}`}
              target="_blank"
              rel="noreferrer"
            >
              <UpRightSquareIcon
                className="cursor-pointer hover:text-white transition"
                size={21}
              />
            </a>
            <button type="button" onClick={() => disconnectEvmWallet()}>
              <PowerIcon
                className="cursor-pointer hover:text-white transition"
                size={21}
              />
            </button>
          </div>
        </div>
        <AccordionContent>
          <div className="text-white ml-8 flex justify-between">
            <div>
              <Skeleton
                className="w-[150px] h-[20px] mb-2"
                isLoading={Boolean(
                  isLoadingEvmNativeTokenBalance && !evmNativeTokenBalance,
                )}
              >
                <div className="text-[20px] mb-2 font-bold flex items-center gap-2">
                  <span>{formattedEvmBalanceValue}</span>
                  <span>{evmNativeTokenBalance?.symbol}</span>
                </div>
              </Skeleton>
              <Skeleton
                className="w-[100px] h-[20px]"
                isLoading={usdcToNativeQuote === null}
              >
                <div className="text-base font-normal">
                  ${usdcToNativeQuote?.value} USD
                </div>
              </Skeleton>
            </div>

            {/* Transactions Section - TODO */}
            {/* <div className="flex items-center">
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
      key="connect-evm-wallet-button"
      onClick={handleConnectWallet}
      className="flex items-center gap-2 py-4 w-full md:w-[300px] text-base"
    >
      <FlameIcon />
      <span>{label}</span>
    </button>
  );
}
