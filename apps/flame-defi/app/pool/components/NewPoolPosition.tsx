import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  Button,
} from "@repo/ui/shadcn-primitives";
import { useState } from "react";
import TokenPairsStep from "./TokenPairsStep";
import PriceRangeStep from "./PriceRangeStep";
import DepositAmountsStep from "./DepositAmountsStep";
import { feeData } from "../../constants";
import { ChevronDownIcon, ResetIcon } from "@repo/ui/icons";
import { useAccount } from "wagmi";
import { useConfig, useEvmChainData } from "config";
import React from "react";
import { EvmCurrency } from "@repo/flame-types";

export interface StepProps {
  step: number;
  setStep: (thing: number) => void;
  tokenPair: TokenPair;
  selectedFeeTier: FeeData | undefined;
}

export interface TokenPair {
  tokenOne: EvmCurrency | undefined;
  tokenTwo: EvmCurrency | undefined;
}

export interface FeeData {
  id: number;
  feePercent: string;
  text: string;
  tvl: string;
  selectPercent: string;
}

export default function NewPoolPosition({
  newPositionPage,
  setNewPositionPage,
}: {
  newPositionPage: boolean;
  setNewPositionPage: (newPositionPage: boolean) => void;
}): React.ReactElement {
  const userAccount = useAccount();
  const { currencies } = useEvmChainData();
  const [step, setStep] = useState(0);
  const [selectedFeeTier, setSelectedFeeTier] = useState<FeeData | undefined>(
    feeData[0],
  );
  const [tokenPair, setTokenPair] = useState<TokenPair>({
    tokenOne: currencies?.[0],
    tokenTwo: undefined,
  });

  const reset = () => {
    setStep(0);
    setTokenPair({
      tokenOne: currencies?.[0],
      tokenTwo: undefined,
    });
    setSelectedFeeTier(feeData[0]);
  };

  return (
    <div>
      <div className="flex items-center justify-start mb-8">
        {userAccount.address && newPositionPage && (
          <div
            className="flex items-center gap-2 cursor-pointer hover:text-orange-soft transition"
            onClick={() => setNewPositionPage(false)}
          >
            <ChevronDownIcon className="rotate-[90deg]" />
            <h2 className="text-lg font-medium">Your Positions</h2>
          </div>
        )}
      </div>
      <div className="flex items-baseline justify-between">
        <Breadcrumb className="mb-5 ml-2">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage
                className={`text-base text-grey-light font-medium ${0 === step ? "text-white" : ""}`}
              >
                Token Pairs/Fees
              </BreadcrumbPage>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage
                className={`text-base text-grey-light font-medium ${1 === step ? "text-white" : ""}`}
              >
                Price Range
              </BreadcrumbPage>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage
                className={`text-base text-grey-light font-medium ${2 === step ? "text-white" : ""}`}
              >
                Deposit Amounts
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <Button
          className="bg-semi-white text-white hover:bg-grey-medium cursor-pointer"
          onClick={reset}
        >
          <ResetIcon size={20} />
          <span>Reset</span>
        </Button>
      </div>
      <div>
        <TokenPairsStep
          step={step}
          setStep={setStep}
          setTokenPair={setTokenPair}
          tokenPair={tokenPair}
          selectedFeeTier={selectedFeeTier}
          setSelectedFeeTier={setSelectedFeeTier}
        />
        <PriceRangeStep
          step={step}
          setStep={setStep}
          tokenPair={tokenPair}
          selectedFeeTier={selectedFeeTier}
        />
        <DepositAmountsStep
          step={step}
          setStep={setStep}
          tokenPair={tokenPair}
          selectedFeeTier={selectedFeeTier}
        />
      </div>
    </div>
  );
}
