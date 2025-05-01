import {
  type ValidateTokenAmountErrorType,
  type Validation,
} from "@repo/ui/hooks";

export type Amount = {
  value: string;
  validation: Validation<ValidateTokenAmountErrorType>;
};
