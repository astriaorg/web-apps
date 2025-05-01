import React from "react";

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
    <div className={`mb-4 ${className || ""}`}>
      <div className="flex flex-col">
        <div className="mb-2 sm:hidden">Amount</div>
        <div className="flex flex-col sm:flex-row sm:items-center">
          <div className="hidden sm:block sm:mr-4 sm:min-w-[60px]">Amount</div>
          <div className="grow">
            <input
              className="w-full p-3 bg-transparent border border-grey-dark focus:border-white focus:outline-hidden rounded-xl text-white text-[20px]"
              type="text"
              placeholder="0.00"
              onChange={updateAmount}
              value={amount}
            />
          </div>
        </div>
      </div>
      {!isAmountValid && hasTouchedForm && (
        <div className="text-status-danger mt-2">
          Amount must be a number greater than 0
        </div>
      )}
    </div>
  );
};
