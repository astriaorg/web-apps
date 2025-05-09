"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";

import { Input, type InputProps } from "@repo/ui/components";
import { useValidateTokenAmount, type ValidationToken } from "@repo/ui/hooks";

import type { Amount } from "./token-amount-input.types";

type Params = {
  token?: ValidationToken;
  minimum?: string;
  balance?: string;
  nonzero?: boolean;
};

export const useTokenAmountInput = ({
  balance,
  minimum,
  token,
  nonzero,
}: Params) => {
  const validate = useValidateTokenAmount();

  const [amount, setAmount] = useState<Amount>({
    value: "",
    validation: { isValid: false },
  });

  const [isPristine, setIsPristine] = useState(true);

  useEffect(() => {
    if (!isPristine) {
      return;
    }
    setIsPristine(!amount.value);
  }, [amount.value, isPristine]);

  const onInput = useCallback(
    ({ value }: { value: string }) => {
      if (!token) {
        return;
      }

      setAmount({
        value,
        validation: validate({
          value,
          token,
          decimals: token.decimals,
          minimum,
          maximum: balance,
          nonzero,
        }),
      });
    },
    [token, balance, minimum, nonzero, setAmount, validate],
  );

  const onReset = useCallback(() => {
    setIsPristine(true);
    setAmount({
      value: "",
      validation: {
        isValid: false,
      },
    });
  }, []);

  const isInvalid = useMemo(() => {
    return !!amount.validation && !amount.validation.isValid;
  }, [amount.validation]);

  return {
    amount,
    onInput,
    onReset,
    isPristine,
    isValid: !isInvalid,
  };
};

export const TokenAmountInput = ({ onInput, ...props }: InputProps) => {
  const handleInput = useCallback(
    (event: React.FormEvent<HTMLInputElement>) => {
      const value = event.currentTarget.value;
      // Remove invalid characters (e.g., letters, multiple dots).
      event.currentTarget.value = value
        .replace(/[^0-9.]/g, "")
        .replace(/(\..*?)\..*/g, "$1");

      onInput?.(event);
    },
    [onInput],
  );

  return <Input onInput={handleInput} {...props} />;
};
