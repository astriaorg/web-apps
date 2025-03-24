"use client";

import { Input } from "@repo/ui/components";
import { useValidateAssetAmount, type ValidationAsset } from "@repo/ui/hooks";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import type { Amount } from "./types";

type Params = {
  asset?: ValidationAsset;
  minimum?: string;
  balance?: string;
};

export const useAssetAmountInput = ({ balance, minimum, asset }: Params) => {
  const validate = useValidateAssetAmount();

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

  const onInput = useCallback<React.ChangeEventHandler<HTMLInputElement>>(
    (evt) => {
      if (!asset) {
        return;
      }

      setAmount({
        value: evt.target.value,
        validation: validate({
          value: evt.target.value,
          asset,
          decimals: asset.decimals,
          minimum,
          maximum: balance,
        }),
      });
    },
    [asset, balance, minimum, setAmount, validate],
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
    return !isPristine && !!amount.validation && !amount.validation.isValid;
  }, [isPristine, amount.validation]);

  return {
    amount,
    onInput,
    onReset,
    isPristine,
    isValid: !isInvalid,
  };
};

export const AssetAmountInput = ({
  onInput,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) => {
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
