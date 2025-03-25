"use client";

import { StepProps } from "../../../types";
import { EditIcon, MinusIcon, PlusIcon } from "@repo/ui/icons";
import { Button, ToggleSwitch } from "@repo/ui/components";
import { useCallback, useEffect, useState } from "react";
import { AreaChartWithRange } from "./area-chart-with-range";
import { MiniAreaChart } from "./mini-area-chart";

const PlusMinusButtons = ({
  handlePriceChange,
}: {
  handlePriceChange: (action: "increase" | "decrease") => void;
}) => {
  return (
    <div className="flex flex-col justify-between">
      <div
        className="cursor-pointer p-2 bg-grey-dark rounded-full text-white hover:bg-grey-medium transition"
        onClick={() => handlePriceChange("increase")}
      >
        <PlusIcon size={20} />
      </div>
      <div
        className="cursor-pointer p-2 bg-grey-dark rounded-full text-white hover:bg-grey-medium transition"
        onClick={() => handlePriceChange("decrease")}
      >
        <MinusIcon size={20} />
      </div>
    </div>
  );
};

enum PRICE_RANGE_OPTIONS {
  FULL_RANGE = "Full Range",
  CUSTOM_RANGE = "Custom Range",
}

export const PriceRangeStep = ({
  step,
  setStep,
  tokenPair,
}: StepProps): React.ReactElement => {
  const { tokenOne, tokenTwo } = tokenPair;
  const [selectedToken, setSelectedToken] = useState(tokenOne?.coinDenom || "");
  const [selectedRange, setSelectedRange] = useState(
    PRICE_RANGE_OPTIONS.FULL_RANGE,
  );
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  useEffect(() => {
    if (minPrice !== "" || maxPrice !== "") {
      setSelectedRange(PRICE_RANGE_OPTIONS.CUSTOM_RANGE);
    }
  }, [minPrice, maxPrice]);

  useEffect(() => {
    if (step === 0) {
      setSelectedToken(tokenOne?.coinDenom || "");
      setSelectedRange(PRICE_RANGE_OPTIONS.FULL_RANGE);
      setMinPrice("");
      setMaxPrice("");
    }
  }, [step, tokenOne]);

  useEffect(() => {
    if (selectedRange === PRICE_RANGE_OPTIONS.FULL_RANGE) {
      setMinPrice("");
      setMaxPrice("");
    } else {
      setMinPrice("0.001");
      setMaxPrice("4");
    }
  }, [selectedRange]);

  const handleMinPriceChange = useCallback(
    (action: "increase" | "decrease") => {
      if (action === "increase") {
        setMinPrice((prev) => (parseFloat(prev) + 0.01).toString());
      } else {
        const newPrice = parseFloat(minPrice) - 0.01;
        if (newPrice >= 0) {
          setMinPrice(newPrice.toString());
        }
      }
    },
    [minPrice],
  );

  const handleMaxPriceChange = useCallback(
    (action: "increase" | "decrease") => {
      if (maxPrice === "") {
        setMaxPrice("0");
      } else if (action === "increase") {
        setMaxPrice((prev) => (parseFloat(prev) + 0.01).toString());
      } else {
        const newPrice = parseFloat(maxPrice) - 0.01;
        if (newPrice >= 0) {
          setMaxPrice(newPrice.toString());
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
                toggleOptions={[
                  tokenOne?.coinDenom || "",
                  tokenTwo?.coinDenom || "",
                ]}
                className="text-sm"
                selectedOption={selectedToken}
                setSelectedOption={setSelectedToken}
              />
            </div>
          </div>
          <div className="h-[40px]">
            <ToggleSwitch
              toggleOptions={[
                PRICE_RANGE_OPTIONS.FULL_RANGE,
                PRICE_RANGE_OPTIONS.CUSTOM_RANGE,
              ]}
              className="text-sm mt-8"
              selectedOption={selectedRange}
              setSelectedOption={(option) =>
                setSelectedRange(option as PRICE_RANGE_OPTIONS)
              }
            />
          </div>
          <p className="text-sm text-grey-light mt-4 mb-4">
            {selectedRange === PRICE_RANGE_OPTIONS.FULL_RANGE
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
                  className="normalize-input w-[75%] sm:max-w-[75%] text-[36px]"
                  placeholder="0"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                />
                <span className="text-sm text-grey-light font-medium">
                  {selectedToken === tokenOne?.coinDenom
                    ? tokenTwo?.coinDenom
                    : tokenOne?.coinDenom}{" "}
                  per {selectedToken}
                </span>
              </div>
              {selectedRange === PRICE_RANGE_OPTIONS.CUSTOM_RANGE && (
                <PlusMinusButtons handlePriceChange={handleMinPriceChange} />
              )}
            </div>
            <div className="flex-1 flex bg-semi-white rounded-r-2xl p-4 border border-solid border-border">
              <div className="flex flex-col">
                <span className="text-sm text-grey-light font-medium">
                  Max Price
                </span>
                <input
                  type="number"
                  className="normalize-input w-[75%] sm:max-w-[75%] text-[36px]"
                  placeholder="∞"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                />
                <span className="text-sm text-grey-light font-medium">
                  {selectedToken === tokenOne?.coinDenom
                    ? tokenTwo?.coinDenom
                    : tokenOne?.coinDenom}{" "}
                  per {selectedToken}
                </span>
              </div>
              {selectedRange === PRICE_RANGE_OPTIONS.CUSTOM_RANGE && (
                <PlusMinusButtons handlePriceChange={handleMaxPriceChange} />
              )}
            </div>
          </div>
          <Button className="mt-8 w-full" onClick={() => setStep(2)}>
            Continue
          </Button>
        </div>
      )}
    </div>
  );
};
