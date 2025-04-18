"use client";

import { FeeTierSelect } from "pool/modules/create-position/components/fee-tier-select";
import { TokenAmountInputs } from "pool/modules/create-position/components/token-amount-inputs";

export const ContentSection = () => {
  return (
    <div className="flex flex-col gap-4">
      <TokenAmountInputs />

      <FeeTierSelect />
    </div>
  );
};
