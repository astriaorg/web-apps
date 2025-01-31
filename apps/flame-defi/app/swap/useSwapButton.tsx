import { createWrapService } from "features/EvmWallet/services/SwapService/SwapService";
import { useAccount, useConfig as useWagmiConfig } from "wagmi";
import { EvmChainInfo, TokenState } from "@repo/ui/types";
import { useEvmWallet } from "features/EvmWallet";

export function useSwapButton(
  inputOne: TokenState,
  inputTwo: TokenState,
  tokenOneBalance: string,
  evmChainsData: EvmChainInfo[],
) {
  const wagmiConfig = useWagmiConfig();
  const userAccount = useAccount();
  const { connectEvmWallet } = useEvmWallet();
  const WTIA_ADDRESS = "0x61B7794B6A0Cc383B367c327B91E5Ba85915a071";

  const handleWrap = async (type: "wrap" | "unwrap") => {
    const wrapService = createWrapService(wagmiConfig, WTIA_ADDRESS);
    if (!evmChainsData[0]?.chainId) return;

    if (type === "wrap") {
      const tx = await wrapService.deposit(
        evmChainsData[0]?.chainId,
        inputOne.value,
        inputOne.token?.coinDecimals || 18,
      );
      console.log({ tx });
      // TODO: Add loading state for these txns. This loading state will be displayed in the buttonText component.
      // TODO: Also add text pointing the user to complete the txn in their wallet
    } else {
      const tx = await wrapService.withdraw(
        evmChainsData[0]?.chainId,
        inputOne.value,
        inputOne.token?.coinDecimals || 18,
      );
      console.log({ tx });
    }
  };

  const handleSwap = async () => {
    // TODO: Add swap service call here
    console.log("DO A SWAP");
  };

  const validSwapInputs =
    inputOne.token &&
    inputTwo.token &&
    inputOne.value !== undefined &&
    inputTwo.value !== undefined &&
    parseFloat(inputOne.value) > 0 &&
    parseFloat(inputTwo.value) > 0 &&
    parseFloat(inputOne.value) <= parseFloat(tokenOneBalance);

  const handleButtonAction = () => {
    if (!userAccount.address) {
      return connectEvmWallet();
    } else if (
      inputOne.token?.coinDenom === "WTIA" ||
      inputTwo.token?.coinDenom === "TIA"
    ) {
      return handleWrap("unwrap");
    } else if (
      inputOne.token?.coinDenom === "TIA" ||
      inputTwo.token?.coinDenom === "WTIA"
    ) {
      return handleWrap("wrap");
    } else if (validSwapInputs) {
      return handleSwap();
    } else {
      return undefined;
    }
  };

  const getButtonText = () => {
    switch (true) {
      case !userAccount.address:
        return "Connect Wallet";
      case !inputOne.token || !inputTwo.token:
        return "Select a token";
      case inputOne.value === undefined || inputTwo.value === undefined:
        return "Enter an amount";
      case parseFloat(inputOne.value) === 0 || parseFloat(inputTwo.value) === 0:
        return "Amount must be greater than 0";
      case isNaN(parseFloat(inputOne.value)) ||
        isNaN(parseFloat(inputTwo.value)):
        return "Amount must be a number";
      case tokenOneBalance === "0" ||
        parseFloat(tokenOneBalance) < parseFloat(inputOne.value):
        return "Insufficient funds";
      case inputOne.token?.coinDenom === "TIA" &&
        inputTwo.token?.coinDenom === "WTIA":
        return "Wrap";
      case inputOne.token?.coinDenom === "WTIA" &&
        inputTwo.token?.coinDenom === "TIA":
        return "Unwrap";
      default:
        return "Swap";
    }
  };
  const buttonText = getButtonText();

  return { handleButtonAction, buttonText, validSwapInputs };
}
