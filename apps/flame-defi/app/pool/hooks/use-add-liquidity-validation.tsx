import { useEffect, useState } from "react";

import { Balance } from "@repo/flame-types";

export const useAddLiquidityValidation = (
  input0: string,
  input1: string,
  token0Balance: Balance | null,
  token1Balance: Balance | null,
) => {
  const [isValid, setIsValid] = useState(true);
  const [buttonText, setButtonText] = useState<string>("Add Liquidity");

  useEffect(() => {
    const parsedInput0 = parseFloat(input0);
    const parsedInput1 = parseFloat(input1);
    const parsedToken0Balance = parseFloat(token0Balance?.value || "0");
    const parsedToken1Balance = parseFloat(token1Balance?.value || "0");

    // Reset validation state
    setIsValid(true);
    setButtonText("Add Liquidity");

    // Check if either input is invalid or zero
    if (
      isNaN(parsedInput0) ||
      isNaN(parsedInput1) ||
      parsedInput0 === 0 ||
      parsedInput1 === 0
    ) {
      setIsValid(false);
      setButtonText("Enter Amount to Add");
      return;
    }

    // Check if either input exceeds the token balance
    if (parsedInput0 > parsedToken0Balance) {
      setIsValid(false);
      setButtonText(`Insufficient ${token0Balance?.symbol ?? "Token"} balance`);
      return;
    }

    if (parsedInput1 > parsedToken1Balance) {
      setIsValid(false);
      setButtonText(`Insufficient ${token1Balance?.symbol ?? "Token"} balance`);
      return;
    }
  }, [input0, input1, token0Balance, token1Balance]);

  return {
    validPoolInputs: isValid,
    buttonText,
  };
};
