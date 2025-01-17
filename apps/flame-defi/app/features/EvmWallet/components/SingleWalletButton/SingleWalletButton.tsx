import React, { useCallback } from "react";
import { useAccount } from "wagmi";

import { CopyToClipboardButton } from "@repo/ui/components";

import { useEvmWallet } from "../../hooks/useEvmWallet";
import { shortenAddress } from "../../../../utils/utils";
import { FlameIcon, PowerIcon, UpRightSquareIcon } from "@repo/ui/icons";
import {
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@repo/ui/shadcn-primitives";

/**
 * Button with information dropdown to connect to an EVM wallet.
 */
export default function SingleWalletButton() {
  const {
    connectEvmWallet,
    disconnectEvmWallet,
    evmNativeTokenBalance,
    isLoadingEvmNativeTokenBalance,
  } = useEvmWallet();
  const userAccount = useAccount();
  //   const [showTransactions, setShowTransactions] = useState(false);

  const handleConnectWallet = useCallback(() => {
    connectEvmWallet();
  }, [connectEvmWallet]);

  return userAccount.address ? (
    <Popover>
      <PopoverTrigger className="flex items-center gap-2 border border-border hover:border-orange-soft rounded-md transition px-3 py-2 h-[36px]">
        <div className="flex items-center gap-2">
          <FlameIcon size={16} />
          <span className="text-white text-base font-normal">
            {shortenAddress(userAccount.address)}
          </span>
        </div>
      </PopoverTrigger>
      <PopoverContent
        side="bottom"
        className="flex flex-col mr-12 gap-3 p-5 bg-radial-dark"
      >
        <div className="">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FlameIcon />
              <span className="text-white text-base font-normal">
                {shortenAddress(userAccount.address)}
              </span>
            </div>
            <div className="flex items-center gap-3 text-grey-light">
              <CopyToClipboardButton textToCopy={userAccount.address} />
              <UpRightSquareIcon
                className="cursor-pointer hover:text-white transition"
                size={21}
              />
              <button type="button" onClick={() => disconnectEvmWallet()}>
                <PowerIcon
                  className="cursor-pointer hover:text-white transition"
                  size={21}
                />
              </button>
            </div>
          </div>

          <div className="text-white ml-8 mt-4">
            <div>
              {isLoadingEvmNativeTokenBalance && <div>Loading...</div>}
              {!isLoadingEvmNativeTokenBalance && evmNativeTokenBalance && (
                <div className="text-[20px] font-bold">
                  {evmNativeTokenBalance}
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
                <i className="fas fa-chevron-right" />
              </button>

              {showTransactions && (
                <div>
                  <div>No recent transactions</div>
                </div>
              )}
            </div> */}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  ) : (
    <Button
      variant="default"
      onClick={handleConnectWallet}
      className="rounded-md bg-button-gradient text-white transition border border-button-gradient hover:border-white text-base w-[156px]"
    >
      <span>Connect</span>
    </Button>
  );
}
