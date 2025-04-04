import {
  Button,
  CopyToClipboardButton,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Skeleton,
} from "@repo/ui/components";
import { PowerIcon, UpRightSquareIcon } from "@repo/ui/icons";
import { FlameIcon } from "@repo/ui/icons/polychrome";
import { formatDecimalValues, shortenAddress } from "@repo/ui/utils";
import { useAstriaChainData } from "config";
import { useAccount } from "wagmi";
import { useEvmWallet } from "../../hooks/use-evm-wallet";

export function SingleWalletContent({
  address,
  handleClose,
}: {
  address: string;
  handleClose?: () => void;
}) {
  //   const [showTransactions, setShowTransactions] = useState(false);
  const { selectedChain } = useAstriaChainData();
  const {
    disconnectEvmWallet,
    evmNativeTokenBalance,
    isLoadingEvmNativeTokenBalance,
    usdcToNativeQuote,
    quoteLoading,
  } = useEvmWallet();
  const formattedEvmBalanceValue = formatDecimalValues(
    evmNativeTokenBalance?.value,
  );

  const handleDisconnect = () => {
    disconnectEvmWallet();
    if (handleClose) {
      handleClose();
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FlameIcon />

          <span className="text-white text-base font-normal">
            {shortenAddress(address)}
          </span>
        </div>
        <div className="flex items-center gap-3 text-grey-light">
          <CopyToClipboardButton textToCopy={address} />
          <a
            href={`${selectedChain.blockExplorerUrl}/address/${address}`}
            target="_blank"
            rel="noreferrer"
          >
            <UpRightSquareIcon
              className="cursor-pointer hover:text-white transition"
              size={21}
            />
          </a>
          <button type="button" onClick={() => handleDisconnect()}>
            <PowerIcon
              className="cursor-pointer hover:text-white transition"
              size={21}
            />
          </button>
        </div>
      </div>

      <div className="text-white ml-8 mt-4">
        <div>
          <Skeleton
            className="w-[100px] h-[20px]"
            isLoading={Boolean(
              isLoadingEvmNativeTokenBalance && !evmNativeTokenBalance,
            )}
          >
            <div className="text-[20px] mb-2 font-bold flex items-center gap-2">
              <span>{formattedEvmBalanceValue}</span>
              <span>{evmNativeTokenBalance?.symbol}</span>
            </div>
          </Skeleton>
          <Skeleton className="w-[100px] h-[20px]" isLoading={quoteLoading}>
            <div className="text-base font-normal">
              ${usdcToNativeQuote?.value} USD
            </div>
          </Skeleton>
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
  );
}

/**
 * Button with information dropdown to connect to an EVM wallet.
 */
export default function SingleWalletConnect() {
  const { connectEvmWallet } = useEvmWallet();
  const userAccount = useAccount();

  return userAccount.address ? (
    <Popover>
      <PopoverTrigger className="flex items-center gap-2 border border-border hover:border-orange-soft rounded-xl transition px-3 py-2 cursor-pointer h-[40px]">
        <div className="flex items-center gap-2">
          <FlameIcon size={16} />
          <span className="text-white text-base font-normal">
            {shortenAddress(userAccount.address)}
          </span>
        </div>
      </PopoverTrigger>
      <PopoverContent
        side="bottom"
        className="flex flex-col mr-12 gap-3 p-5 bg-radial-dark w-full md:w-[300px] border border-border"
      >
        <SingleWalletContent address={userAccount.address} />
      </PopoverContent>
    </Popover>
  ) : (
    <Button
      variant="gradient"
      onClick={() => connectEvmWallet()}
      className="text-base w-[156px]"
    >
      <span>Connect</span>
    </Button>
  );
}
