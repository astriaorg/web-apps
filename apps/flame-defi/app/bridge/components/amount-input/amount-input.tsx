import React from "react";

import { Card, CardFigureInput } from "@repo/ui/components";

type AmountInputProps = {
  amount: string;
  setAmount: (amount: string) => void;
  isAmountValid: boolean;
  hasTouchedForm: boolean;
  className?: string;
};

/**
 * Shared amount input component for deposit and withdraw pages.
 */
export const AmountInput = ({
  amount,
  setAmount,
  isAmountValid,
  hasTouchedForm,
  className,
}: AmountInputProps) => {
  const updateAmount = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(event.target.value);
  };

  return (
    <div className="flex flex-col">
      <Card variant="secondary" className={`p-6 mb-4 ${className || ""}`}>
        <div className="flex flex-col">
          <div className="mb-2 sm:hidden">Amount</div>
          <div className="flex flex-col sm:flex-row sm:items-center">
            <div className="hidden sm:block sm:mr-4 sm:min-w-[60px]">
              Amount
            </div>
            <div className="grow">
              <CardFigureInput
                className="sm:text-right"
                onChange={updateAmount}
                value={amount}
              />
            </div>
          </div>
        </div>
      </Card>
      {!isAmountValid && hasTouchedForm && (
        <div className="text-danger text-xs">
          Amount must be a number greater than 0.
        </div>
      )}
    </div>
  );
};
