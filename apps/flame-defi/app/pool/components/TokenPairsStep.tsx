import React, { useState } from "react";
import { useEvmChainData } from "config";
import { EvmCurrency } from "@repo/flame-types";
import { ActionButton, TokenSelector } from "@repo/ui/components";
import { Button, DialogTrigger } from "@repo/ui/shadcn-primitives";
import { CheckMarkIcon, ChevronDownIcon, EditIcon } from "@repo/ui/icons";
import { FeeData, TokenPair } from "./NewPoolPosition";
import { feeData } from "../../constants";

export interface TokenPairsStepProps {
  step: number;
  setStep: (thing: number) => void;
  setTokenPair: (thing: TokenPair) => void;
  tokenPair: TokenPair;
  selectedFeeTier: FeeData | undefined;
  setSelectedFeeTier: (thing: FeeData) => void;
}

const CustomTokenButton = ({
  selectedToken,
  defaultTitle,
}: {
  selectedToken?: EvmCurrency | null;
  defaultTitle: string;
}) => (
  <DialogTrigger className="w-full">
    <div
      className={`flex items-center justify-between bg-black rounded-2xl border border-solid border-border p-3 hover:border-grey-medium transition px-4`}
    >
      <div className="flex items-center">
        {selectedToken?.IconComponent && (
          <selectedToken.IconComponent size={20} />
        )}
        <h2 className="text-lg font-medium mx-2 whitespace-nowrap">
          {selectedToken?.coinDenom || defaultTitle}
        </h2>
      </div>
      <ChevronDownIcon size={20} />
    </div>
  </DialogTrigger>
);

export default function TokenPairsStep({
  step,
  setStep,
  setTokenPair,
  tokenPair,
  selectedFeeTier,
  setSelectedFeeTier,
}: TokenPairsStepProps): React.ReactElement {
  const {
    selectedChain: { currencies },
  } = useEvmChainData();

  const [showMore, setShowMore] = useState(false);
  const { tokenOne, tokenTwo } = tokenPair;
  const setToken = (
    position: "tokenOne" | "tokenTwo",
    token: EvmCurrency | undefined,
  ) => {
    setTokenPair({
      ...tokenPair,
      [position]: token,
    });
  };

  return (
    <div>
      {step > 0 && (
        <div className="gradient-container lg:p-6 lg:px-12">
          <div className="flex justify-between">
            <div className="flex items-center gap-2">
              {tokenOne?.IconComponent && <tokenOne.IconComponent />}
              {tokenTwo?.IconComponent && (
                <tokenTwo.IconComponent className="absolute ml-4" />
              )}
              <h2 className="text-lg font-semibold ml-5">
                {tokenOne?.coinDenom} / {tokenTwo?.coinDenom}
              </h2>
              <span className="bg-semi-white text-white text-xs px-3 py-1 rounded-xl">
                Fees: {selectedFeeTier?.feePercent}
              </span>
            </div>
            <Button
              className="bg-semi-white text-white hover:bg-grey-medium cursor-pointer"
              onClick={() => setStep(0)}
              disabled={
                tokenPair.tokenOne === undefined ||
                tokenPair.tokenTwo === undefined
              }
            >
              <EditIcon size={20} />
              <span>Edit</span>
            </Button>
          </div>
        </div>
      )}
      {step === 0 && (
        <div className="max-w-[800px] w-full mx-auto rounded-2xl p-4 sm:p-4 md:p-8 lg:p-12 border border-solid border-transparent bg-radial-dark shadow-[inset_1px_1px_1px_-1px_hsla(0,0%,100%,0.5)]">
          <div>
            <h2 className="text-lg font-medium">Select pair</h2>
            <p className="text-sm text-grey-light">
              Choose the tokens you want to provide liquidity for.
            </p>
            <div className="flex gap-8 justify-between mt-4">
              <TokenSelector
                tokens={currencies}
                selectedToken={tokenPair.tokenOne}
                setSelectedToken={(token) => setToken("tokenOne", token)}
                CustomTokenButton={CustomTokenButton}
              />
              <TokenSelector
                tokens={currencies}
                selectedToken={tokenPair.tokenTwo}
                setSelectedToken={(token) => setToken("tokenTwo", token)}
                CustomTokenButton={CustomTokenButton}
              />
            </div>
          </div>
          <div className="flex flex-col mt-8">
            <div>
              <h2 className="text-lg font-medium">Fee tier</h2>
              <p className="text-sm text-grey-light">
                The amount earned providing liquidity. Choose an amount that
                suits your risk tolerance and strategy.
              </p>
            </div>
            <div className="flex border border-solid border-border rounded-2xl p-4 mt-4">
              <div className="flex flex-col w-full items-start">
                <span className="text-white text-base font-medium">
                  {selectedFeeTier?.feePercent} fee tier
                  {selectedFeeTier?.id === 0 && (
                    <span className="px-2 py-1 bg-semi-white rounded-2xl text-orange-soft text-sm ml-2">
                      Recommended
                    </span>
                  )}
                </span>
                <span className="text-grey-light text-sm pl-0 pt-1">
                  {selectedFeeTier?.text}
                </span>
              </div>
              <div className="flex items-center justify-center">
                <Button
                  className="bg-semi-white text-white hover:bg-grey-medium"
                  onClick={() => setShowMore(!showMore)}
                  disabled={
                    tokenPair.tokenOne === undefined ||
                    tokenPair.tokenTwo === undefined
                  }
                >
                  <span>{showMore ? "Less" : "More"}</span>
                  <ChevronDownIcon
                    size={20}
                    className={`transform transition-transform duration-200 ${showMore ? "rotate-180" : ""}`}
                  />
                </Button>
              </div>
            </div>
            <div
              className={`flex justify-between gap-4 transition-all duration-500 ${
                showMore
                  ? "opacity-100 h-auto"
                  : "opacity-0 h-0 overflow-hidden"
              }`}
            >
              {feeData.map(({ feePercent, text, tvl, selectPercent }, i) => (
                <div
                  key={i}
                  className={`w-full md:w-1/4 flex justify-between flex-col border border-solid border-border rounded-2xl p-4 mt-4 cursor-pointer hover:border-grey-medium transition ${selectedFeeTier?.id === i ? "border-orange-soft" : ""}`}
                  onClick={() => feeData[i] && setSelectedFeeTier(feeData[i])}
                >
                  <div className="flex flex-col mb-4">
                    <span className="text-white text-base font-medium flex justify-between">
                      {feePercent}
                      {selectedFeeTier?.id === i && (
                        <CheckMarkIcon size={20} className="text-orange-soft" />
                      )}
                    </span>
                    <span className="text-white text-xs">{text}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-grey-light text-xs">{tvl}</span>
                    <span className="text-grey-light text-xs">
                      {selectPercent}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <ActionButton
              className="mt-8 w-full"
              buttonText="Continue"
              callback={() => setStep(1)}
              disabled={
                tokenPair.tokenOne === undefined ||
                tokenPair.tokenTwo === undefined
              }
            />
          </div>
        </div>
      )}
    </div>
  );
}
