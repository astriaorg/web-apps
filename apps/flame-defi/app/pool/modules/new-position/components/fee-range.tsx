"use client";

import React from "react";
import { CheckMarkIcon } from "@repo/ui/icons";
import { FeeData } from "../../../types";
import { usePoolContext } from "pool/hooks";
import { cn } from "@repo/ui/utils";

export interface FeeRangeProps {
  selectedFeeTier: FeeData;
  setSelectedFeeTier: (feeTier: FeeData) => void;
}

export const FeeRange = ({
  selectedFeeTier,
  setSelectedFeeTier,
}: FeeRangeProps): React.ReactElement => {
  const { feeData } = usePoolContext();

  return (
    <div className="flex flex-col gap-2">
      {feeData.map(({ feePercent, text, selectPercent }, i) => (
        <div
          key={i}
          className={cn(
            "w-full flex bg-surface-1 items-center justify-between border border-solid border-transparent rounded-2xl p-4 cursor-pointer hover:border-grey-medium transition",
            selectedFeeTier.id === i && "border-orange-soft",
          )}
          onClick={() => feeData[i] && setSelectedFeeTier(feeData[i])}
        >
          <div className="flex">
            <span className="text-white text-base font-medium flex gap-1 items-center w-[85px] mr-4">
              <CheckMarkIcon
                size={20}
                className={cn(
                  "text-orange-soft",
                  selectedFeeTier.id === i ? "opacity-100" : "opacity-0",
                )}
              />
              {feePercent}
            </span>
            <span className="text-grey-light text-sm text-left">{text}</span>
          </div>

          <div className="flex bg-surface-2 text-white text-sm px-3 py-1 rounded-xl group-hover:bg-black transition items-center gap-2">
            <span className="text-grey-light text-sm">select</span>
            <span className="text-grey-light text-sm">{selectPercent}</span>
          </div>
        </div>
      ))}
    </div>
  );
};