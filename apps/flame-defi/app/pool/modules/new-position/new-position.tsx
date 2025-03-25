"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  Button,
} from "@repo/ui/components";
import React, { useState } from "react";
import { ChevronDownIcon, ResetIcon } from "@repo/ui/icons";
import { useAccount } from "wagmi";
import { useEvmChainData } from "config";
import Link from "next/link";
import {
  TokenPairsStep,
  PriceRangeStep,
  DepositAmountsStep,
} from "./components";
import { FeeData, TokenPair } from "../../types";
import { usePoolContext } from "pool/hooks";

export const NewPosition = () => {
  const { feeData } = usePoolContext();
  const userAccount = useAccount();
  const {
    selectedChain: { currencies },
  } = useEvmChainData();
  const [step, setStep] = useState(0);
  const defaultFeeData = feeData.find((fee) => fee.feePercent === "0.3%");
  const [selectedFeeTier, setSelectedFeeTier] = useState<FeeData | undefined>(
    defaultFeeData,
  );
  const [tokenPair, setTokenPair] = useState<TokenPair>({
    tokenOne: currencies?.[0] || null,
    tokenTwo: null,
  });

  const reset = () => {
    setStep(0);
    setTokenPair({
      tokenOne: currencies?.[0] || null,
      tokenTwo: null,
    });
    setSelectedFeeTier(defaultFeeData);
  };

  return (
    <div className="max-w-[700px] w-full mx-auto">
      <div className="flex items-center justify-start mb-8">
        {userAccount.address && (
          <Link
            className="flex items-center gap-2 cursor-pointer hover:text-orange-soft transition"
            href="/pool"
          >
            <ChevronDownIcon className="rotate-[90deg]" />
            <h2 className="text-lg font-medium">Your Positions</h2>
          </Link>
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
};
