import Big from "big.js";
import { type Validation, type ValidationAsset } from "./types";

type Params = {
  value: string;
  asset: ValidationAsset;
  decimals?: number;
  minimum?: string;
  maximum?: string;
  canBeZero?: boolean;
};

type ValidateState = Pick<Validation, "isValid"> & {
  number: boolean;
  decimals: boolean;
  minimum: boolean;
  maximum: boolean;
  zero: boolean;
};

export const validate = ({
  value,
  decimals,
  minimum,
  maximum,
  canBeZero,
}: Params): ValidateState => {
  const res = {
    number: false,
    decimals: false,
    minimum: false,
    maximum: false,
    zero: false,
  };

  if (!value) {
    return { ...res, isValid: false };
  }

  try {
    const amount = Big(value);

    res.number = true;
    res.minimum = minimum ? amount.gte(minimum) : true;
    res.maximum = maximum ? amount.lte(maximum) : true;
    res.zero = !canBeZero ? amount.gt(0) : true;

    const decimalIndex = value.indexOf(".");
    const decimal =
      decimalIndex !== -1 ? value.substring(decimalIndex + 1) : undefined;
    res.decimals = decimals
      ? decimal
        ? decimal.length <= decimals
        : true
      : true;
    // eslint-disable-next-line no-empty
  } catch {}

  return {
    ...res,
    isValid: Object.values(res).every((it) => !!it),
  };
};

export const useValidateAssetAmount = () => {
  return (params: Params): Validation => {
    const state = validate(params);

    const errors: string[] = [];

    if (!state.number) {
      errors.push(`Invalid amount.`);
    }
    if (!state.decimals) {
      errors.push(`Invalid amount. Maximum ${params.decimals} decimals.`);
    }
    if (!state.zero) {
      errors.push(`Amount cannot be 0.`);
    }
    if (!state.minimum) {
      errors.push(`The minimum amount is ${params.minimum}.`);
    }
    if (!state.maximum) {
      errors.push(`Insufficient ${params.asset.symbol} balance.`);
    }

    return { isValid: state.isValid, errors };
  };
};
