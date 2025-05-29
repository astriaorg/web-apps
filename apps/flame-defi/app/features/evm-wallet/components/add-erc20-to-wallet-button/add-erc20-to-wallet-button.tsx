import type { EIP1193Provider } from "viem";
import { useAccount } from "wagmi";

import type { EvmCurrency } from "@repo/flame-types";

interface AddErc20ToWalletButtonProps {
  evmCurrency: EvmCurrency;
  buttonClassNameOverride?: string;
}

// TODO - move to hook useAddErc20ToWallet
export function AddErc20ToWalletButton({
  evmCurrency,
  buttonClassNameOverride,
}: AddErc20ToWalletButtonProps) {
  const { connector, isConnected } = useAccount();

  const buttonClassName =
    buttonClassNameOverride ?? "p-0 is-size-7 has-text-light is-ghost";

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
    <>
      <button
        type="button"
        key={evmCurrency.coinMinimalDenom}
        onClick={() => addCoinToWallet()}
        className={`px-3 py-0 rounded-2xl bg-grey-dark hover:bg-grey-medium text-white text-sm cursor-pointer transition ${buttonClassName}`}
      >
        Add to wallet
      </button>
    </>
  );
}
