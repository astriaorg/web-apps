"use client";

import { StepProps } from "./NewPoolPosition";
import { ActionButton } from "@repo/ui/components";
import { TokenState } from "@repo/ui/types";
import { useState } from "react";
import { useDepositTxn } from "../useDepositTxn";

export default function DepositAmountsStep({
  step,
  tokenPair,
}: StepProps): React.ReactElement {
  const { tokenOne, tokenTwo } = tokenPair;
  const [inputOne, setInputOne] = useState<TokenState>({
    token: tokenOne,
    value: "",
  });
  const [inputTwo, setInputTwo] = useState<TokenState>({
    token: tokenTwo,
    value: "",
  });
  const actionText = useDepositTxn(inputOne, inputTwo);

  const handleInputChange = (value: string, isInputOne: boolean) => {
    if (isInputOne) {
      setInputOne((prev) => ({ ...prev, value: value }));
    } else {
      setInputTwo((prev) => ({ ...prev, value: value }));
    }
  };

  return (
    <div>
      {step === 2 && (
        <div className="mt-5 gradient-container">
          <h2 className="text-lg font-medium">Deposit tokens</h2>
          <p className="text-sm text-grey-light">
            Specify the token amounts for your liquidity contribution.
          </p>
          <div
            onKeyDown={() => null}
            className={`flex flex-col rounded-md p-transition bg-semi-white border border-solid border-transparent hover:border-grey-medium mt-4 p-4`}
          >
            <div className="flex justify-between items-center">
              <div className="flex flex-col items-start">
                <input
                  type="number"
                  value={inputOne.value}
                  onChange={(e) => handleInputChange(e.target.value, true)}
                  className="normalize-input w-[100%]"
                  placeholder="0"
                />
                <span className="text-grey-light text-sm font-medium">$0</span>
              </div>
              <div className="flex flex-col items-end">
                <div className="flex items-center space-x-2 text-lg font-medium gap-2">
                  {tokenOne?.IconComponent && (
                    <tokenOne.IconComponent size={24} />
                  )}
                  {tokenOne?.coinDenom}
                </div>
                <div className="text-sm font-medium text-grey-light flex items-center mt-3">
                  {/* TODO: This will be replaced with the wallet balance */}
                  <span>{"0"}</span>
                  <span className="ml-1">{tokenOne?.coinDenom}</span>
                  <span className="px-3 py-0 ml-2 rounded-2xl bg-grey-dark hover:bg-grey-medium text-orange-soft text-sm cursor-pointer transition">
                    Max
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div
            onKeyDown={() => null}
            className={`flex flex-col rounded-md p-transition bg-semi-white border border-solid border-transparent hover:border-grey-medium mt-2 p-4`}
          >
            <div className="flex justify-between items-center">
              <div className="flex flex-col items-start">
                <input
                  type="number"
                  value={inputTwo.value}
                  onChange={(e) => handleInputChange(e.target.value, false)}
                  className="normalize-input w-[100%]"
                  placeholder="0"
                />
                <span className="text-grey-light text-sm font-medium">$0</span>
              </div>
              <div className="flex flex-col items-end">
                <div className="flex items-center space-x-2 text-lg font-medium gap-2">
                  {tokenTwo?.IconComponent && (
                    <tokenTwo.IconComponent size={24} />
                  )}
                  {tokenTwo?.coinDenom}
                </div>
                <div className="text-sm font-medium text-grey-light flex items-center mt-3">
                  {/* TODO: This will be replaced with the wallet balance */}
                  <span>{"0"}</span>
                  <span className="ml-1">{tokenTwo?.coinDenom}</span>
                  <span className="px-3 py-0 ml-2 rounded-2xl bg-grey-dark hover:bg-grey-medium text-orange-soft text-sm cursor-pointer transition">
                    Max
                  </span>
                </div>
              </div>
            </div>
          </div>
          {/* TODO: This is a temp example of how we might conditionally render the action button */}
          {actionText !== "Deposit" && (
            <div className="flex items-center justify-center text-grey-light font-semibold px-4 py-3 rounded-xl bg-semi-white mt-5">
              {actionText}
            </div>
          )}
          {/* TODO: This is a temp example of how we might conditionally render the action button */}
          {actionText === "Deposit" && (
            <ActionButton
              callback={() => console.log("DO A DEPOSIT")}
              buttonText="Deposit"
              className="w-full mt-5"
            />
          )}
        </div>
      )}
    </div>
  );
}
