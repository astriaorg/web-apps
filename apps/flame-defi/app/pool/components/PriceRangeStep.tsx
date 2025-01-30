"use client";

import { StepProps } from "./NewPoolPosition";
import { EditIcon, MinusIcon, PlusIcon } from "@repo/ui/icons";
import { ActionButton, ToggleSwitch } from "@repo/ui/components";
import { useCallback, useEffect, useState } from "react";
import AreaChartWithRange from "./AreaChartWithRange";
import { Button } from "@repo/ui/shadcn-primitives";
import MiniAreaChart from "./MiniAreaChart";

export default function PriceRangeStep({
  step,
  setStep,
  tokenPair,
}: StepProps): React.ReactElement {
  const { tokenOne, tokenTwo } = tokenPair;
  const [selectedToken, setSelectedToken] = useState(tokenOne?.symbol || "");
  const [selectedRange, setSelectedRange] = useState("Full Range");
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(Infinity);

  useEffect(() => {
    if (step === 0) {
      setSelectedToken(tokenOne?.symbol || "");
      setSelectedRange("Full Range");
      setMinPrice(0);
      setMaxPrice(Infinity);
    }
  }, [step, tokenOne]);

  useEffect(() => {
    if (selectedRange === "Full Range") {
      setMinPrice(0);
      setMaxPrice(Infinity);
    } else {
      setMinPrice(0.001);
      setMaxPrice(4);
    }
  }, [selectedRange]);

  const handleMinPriceChange = useCallback(
    (action: "increase" | "decrease") => {
      if (action === "increase") {
        setMinPrice(minPrice + 0.01);
      } else {
        const newPrice = minPrice - 0.01;
        if (newPrice >= 0) {
          setMinPrice(newPrice);
        }
      }
    },
    [minPrice],
  );

  const handleMaxPriceChange = useCallback(
    (action: "increase" | "decrease") => {
      if (maxPrice === Infinity) {
        setMaxPrice(0);
      } else if (action === "increase") {
        setMaxPrice(maxPrice + 0.01);
      } else {
        const newPrice = maxPrice - 0.01;
        if (newPrice >= 0) {
          setMaxPrice(newPrice);
        }
      }
    },
    [maxPrice],
  );

  return (
    <div>
      {step > 1 && (
        <div className="gradient-container lg:p-6 lg:px-12 mt-5">
          <div className="flex justify-between">
            <div className="flex items-center bg-[rgba(230,149,41,0.1)]">
              <MiniAreaChart />
            </div>
            <div className="flex items-center gap-8">
              <div className="text-base text-grey-light font-medium">
                {selectedRange}
              </div>
              <Button
                className="bg-semi-white text-white hover:bg-grey-medium cursor-pointer"
                onClick={() => setStep(1)}
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
        </div>
      )}
      {step === 1 && (
        <div className="mt-5 gradient-container">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium">Set price range</h2>
            <div className="w-[200px] h-[40px]">
              <ToggleSwitch
                toggleOptions={[tokenOne?.symbol || "", tokenTwo?.symbol || ""]}
                className="text-sm"
                selectedOption={selectedToken}
                setSelectedOption={setSelectedToken}
              />
            </div>
          </div>
          <div className="h-[40px]">
            <ToggleSwitch
              toggleOptions={["Full Range", "Custom Range"]}
              className="text-sm mt-8"
              selectedOption={selectedRange}
              setSelectedOption={setSelectedRange}
            />
          </div>
          <p className="text-sm text-grey-light mt-4 mb-4">
            {selectedRange === "Full Range"
              ? "Providing full range liquidity ensures continuous market participation across all possible prices, offering simplicity but with potential for higher impermanent loss."
              : "Custom range allows you to concentrate your liquidity within specific price bounds, enhancing capital efficiency and fee earnings but requiring more active management."}
          </p>
          <div className="p-4 bg-black rounded-2xl border border-solid border-border">
            <AreaChartWithRange />
          </div>
          <div className="flex mt-4 gap-1">
            <div className="flex-1 flex bg-semi-white rounded-l-2xl p-4 border border-solid border-border">
              <div className="flex flex-col ">
                <span className="text-sm text-grey-light font-medium">
                  Min Price
                </span>
                <input
                  type="number"
                  className="normalize-input w-[75%] sm:max-w-[75%]"
                  placeholder="0"
                  value={minPrice}
                  onChange={(e) => setMinPrice(Number(e.target.value))}
                />
                <span className="text-sm text-grey-light font-medium">
                  {selectedToken === tokenOne?.symbol
                    ? tokenTwo?.symbol
                    : tokenOne?.symbol}{" "}
                  per {selectedToken}
                </span>
              </div>
              <div className="flex flex-col justify-between">
                <div
                  className="cursor-pointer p-2 bg-grey-dark rounded-full text-white hover:bg-grey-medium transition"
                  onClick={() => handleMinPriceChange("increase")}
                >
                  <PlusIcon size={20} />
                </div>
                <div
                  className="cursor-pointer p-2 bg-grey-dark rounded-full text-white hover:bg-grey-medium transition"
                  onClick={() => handleMinPriceChange("decrease")}
                >
                  <MinusIcon size={20} />
                </div>
              </div>
            </div>
            <div className="flex-1 flex bg-semi-white rounded-r-2xl p-4 border border-solid border-border">
              <div className="flex flex-col">
                <span className="text-sm text-grey-light font-medium">
                  Max Price
                </span>
                <input
                  type="number"
                  className="normalize-input w-[75%] sm:max-w-[75%]"
                  placeholder="∞"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                />
                <span className="text-sm text-grey-light font-medium">
                  {selectedToken === tokenOne?.symbol
                    ? tokenTwo?.symbol
                    : tokenOne?.symbol}{" "}
                  per {selectedToken}
                </span>
              </div>
              <div className="flex flex-col justify-between">
                <div
                  className="cursor-pointer p-2 bg-grey-dark rounded-full text-white hover:bg-grey-medium transition"
                  onClick={() => handleMaxPriceChange("increase")}
                >
                  <PlusIcon size={20} />
                </div>
                <div
                  className="cursor-pointer p-2 bg-grey-dark rounded-full text-white hover:bg-grey-medium transition"
                  onClick={() => handleMaxPriceChange("decrease")}
                >
                  <MinusIcon size={20} />
                </div>
              </div>
            </div>
          </div>
          <ActionButton
            className="mt-8 w-full"
            buttonText="Continue"
            callback={() => setStep(2)}
          />
        </div>
      )}
    </div>
  );
}
