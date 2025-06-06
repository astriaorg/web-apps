"use client";

import { useState } from "react";
import { useIntl } from "react-intl";

import { InfoTooltip } from "@repo/ui/components";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Switch,
} from "@repo/ui/components";
import { GearIcon } from "@repo/ui/icons";
import { getFromLocalStorage, setInLocalStorage } from "@repo/ui/utils";
import { useConfig } from "config";

export const SettingsPopover = () => {
  const { formatNumber } = useIntl();
  const { defaultSlippageTolerance } = useConfig();
  const currentSettings = getFromLocalStorage("settings") || {};
  const [customSlippage, setCustomSlippage] = useState<number>(
    currentSettings?.slippageTolerance || defaultSlippageTolerance,
  );
  const [slippageError, setSlippageError] = useState<{
    msg: string;
    error: boolean;
  } | null>(null);
  const [expertMode, setExpertMode] = useState(
    currentSettings?.expertMode || false,
  );
  const [showExpertModeDialog, setShowExpertModeDialog] = useState(false);

  const handleSlippageError = (value: number) => {
    const lowest = 0.05;
    const highest = 1;
    const errorHigh = 50;
    if (value === 0 || isNaN(value)) {
      setSlippageError(null);
    } else if (value < lowest) {
      setSlippageError({ msg: "Your transaction may fail", error: false });
    } else if (value > highest && value <= errorHigh) {
      setSlippageError({
        msg: "Your transaction may be frontrun",
        error: false,
      });
    } else if (value > errorHigh || value < 0) {
      setSlippageError({
        msg: "Enter a valid slippage percentage",
        error: true,
      });
    } else {
      setSlippageError(null);
    }
  };

  const handleCustomSlippageChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const value = parseFloat(e.target.value);
    handleSlippageError(value);
    setCustomSlippage(value);
    if (!isNaN(value) && value > 0) {
      setInLocalStorage("settings", {
        ...currentSettings,
        slippageTolerance: value,
      });
    }
  };

  const handleExpertModeChange = () => {
    if (!expertMode) {
      setShowExpertModeDialog(true);
    } else {
      setExpertMode(false);
      setCustomSlippage(defaultSlippageTolerance);
      setInLocalStorage("settings", {
        ...currentSettings,
        expertMode: false,
        slippageTolerance: defaultSlippageTolerance,
      });
      setSlippageError(null);
    }
  };

  const handlePopoverOpenChange = () => {
    if (slippageError?.error && expertMode) {
      setCustomSlippage(defaultSlippageTolerance);
      setSlippageError(null);
    }
  };

  return (
    <Popover onOpenChange={handlePopoverOpenChange}>
      <PopoverTrigger>
        <a
          className="text-typography-light hover:text-typography-default cursor-pointer"
          aria-label="Settings"
        >
          <GearIcon
            className={`transition ${expertMode ? "text-orange" : ""}`}
          />
        </a>
      </PopoverTrigger>
      <PopoverContent className="w-80 bg-surface-2 border-stroke-default" align="end">
        <div className="space-y-4">
          <h2 className="text-md font-semibold text-typography-default">Settings</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <div className="flex items-center gap-1">
                <label className="text-sm text-typography-default">Expert Mode</label>
                <InfoTooltip
                  className="max-w-[250px]"
                  content="Allow high price impact trades and skip the confirm screen. Use at your own risk."
                />
              </div>
              <Switch
                checked={expertMode}
                onCheckedChange={handleExpertModeChange}
                className="h-7 w-12 data-[state=unchecked]:bg-typography-light data-[state=checked]:bg-orange [&>span]:h-6 [&>span]:w-6 [&>span[data-state=checked]]:translate-x-5"
              />
            </div>
          </div>
          <div className="space-y-2 mb-2">
            <div className="flex items-center gap-1">
              <label className="text-sm text-typography-default">Slippage Tolerance</label>
              <InfoTooltip
                className="max-w-[250px]"
                content="Your transaction will revert if the price changes unfavorably by more than this percentage."
              />
            </div>
            <div className="flex justify-between">
              <button
                disabled={!expertMode}
                className="text-sm text-typography-inverted bg-orange px-3 py-1 rounded-lg mr-2 cursor-pointer"
                onClick={() => setCustomSlippage(defaultSlippageTolerance)}
              >
                Auto
              </button>
              <div className="flex-1 relative">
                <input
                  disabled={!expertMode}
                  type="number"
                  value={customSlippage}
                  onChange={handleCustomSlippageChange}
                  placeholder={formatNumber(defaultSlippageTolerance, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                  className="w-full px-3 py-1 pr-7 bg-surface-3 font-sans rounded-lg text-typography-default text-right placeholder:text-typography-light placeholder:text-right focus:outline-hidden focus:ring-1 focus:ring-orange normalize-input"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-typography-default">
                  %
                </span>
              </div>
            </div>
          </div>
          <div className="h-4">
            {slippageError && (
              <p
                className={`text-sm ${slippageError.error ? "text-danger" : "text-orange"}`}
              >
                {slippageError.msg}
              </p>
            )}
          </div>
        </div>
      </PopoverContent>

      <AlertDialog
        open={showExpertModeDialog}
        onOpenChange={setShowExpertModeDialog}
      >
        <AlertDialogContent className="bg-surface-2 border-stroke-default">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-typography-default">
              Are you sure?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-typography-light">
              Expert mode turns off the confirm transaction prompt and allows
              high slippage trades that often result in bad rates and lost
              funds.
            </AlertDialogDescription>
            <AlertDialogTitle className="text-typography-default">
              ONLY USE THIS MODE IF YOU KNOW WHAT YOU ARE DOING.
            </AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-surface-3 text-typography-default hover:bg-typography-light cursor-pointer">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-orange text-typography-inverted hover:bg-orange/90 cursor-pointer"
              onClick={() => {
                setExpertMode(true);
                setInLocalStorage("settings", {
                  ...currentSettings,
                  expertMode: true,
                });
                setShowExpertModeDialog(false);
              }}
            >
              Turn On Expert Mode
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Popover>
  );
};
