import { TokenBalance } from "pool/types";
import { useState, useEffect } from "react";

export const useAddLiquidityValidation = (
  inputOne: string,
  inputTwo: string,
  tokenOneBalance: TokenBalance | null,
  tokenTwoBalance: TokenBalance | null,
) => {
  const [isValid, setIsValid] = useState(true);
  const [buttonText, setButtonText] = useState<string>("Add Liquidity");

  useEffect(() => {
    const parsedInputOne = parseFloat(inputOne);
    const parsedInputTwo = parseFloat(inputTwo);
    const parsedTokenOneBalance = parseFloat(tokenOneBalance?.value || "0");
    const parsedTokenTwoBalance = parseFloat(tokenTwoBalance?.value || "0");

    // Reset validation state
    setIsValid(true);
    setButtonText("Add Liquidity");

    // Check if either input is invalid or zero
    if (
      isNaN(parsedInputOne) ||
      isNaN(parsedInputTwo) ||
      parsedInputOne === 0 ||
      parsedInputTwo === 0
    ) {
      setIsValid(false);
      setButtonText("Enter Amount to Add");
      return;
    }

    // Check if either input exceeds the token balance
    if (parsedInputOne > parsedTokenOneBalance) {
      setIsValid(false);
      setButtonText(
        `Insufficient ${tokenOneBalance?.symbol ?? "Token"} balance`,
      );
      return;
    }

    if (parsedInputTwo > parsedTokenTwoBalance) {
      setIsValid(false);
      setButtonText(
        `Insufficient ${tokenTwoBalance?.symbol ?? "Token"} balance`,
      );
      return;
    }
  }, [inputOne, inputTwo, tokenOneBalance, tokenTwoBalance]);

  return {
    validPoolInputs: isValid,
    buttonText,
  };
};
