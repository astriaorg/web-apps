import type { EIP1193Provider } from "viem";
import { useAccount } from "wagmi";

import type { EvmCurrency } from "@repo/flame-types";
import { Badge } from "@repo/ui/components";

interface AddErc20ToWalletButtonProps {
  evmCurrency: EvmCurrency;
}

// TODO - move to hook useAddErc20ToWallet
export function AddErc20ToWalletButton({
  evmCurrency,
}: AddErc20ToWalletButtonProps) {
  const { connector, isConnected } = useAccount();

  const addCoinToWallet = async () => {
    if (!connector || !isConnected) {
      console.debug("User is not connected to a wallet");
      return;
    }
    const contractAddress = evmCurrency.erc20ContractAddress?.toString();
    if (!contractAddress) {
      console.debug("Token is not an ERC20 or no contract address provided.");
      return;
    }
    try {
      const provider = await connector.getProvider();
      await (provider as EIP1193Provider)?.request({
        method: "wallet_watchAsset",
        params: {
          type: "ERC20",
          options: {
            address: contractAddress,
            symbol: evmCurrency.coinDenom,
            decimals: evmCurrency.coinDecimals,
          },
        },
      });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Badge
      variant="secondary"
      key={evmCurrency.coinMinimalDenom}
      onClick={() => addCoinToWallet()}
      className="cursor-pointer user-select-none"
    >
      Add to Wallet
    </Badge>
  );
}
