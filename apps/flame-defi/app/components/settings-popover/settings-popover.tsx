"use client";

import { useState } from "react";
import { useIntl } from "react-intl";

import { Button, InfoTooltip, Input } from "@repo/ui/components";
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
        msg: "Your transaction may be frontrun.",
        error: false,
      });
    } else if (value > errorHigh || value < 0) {
      setSlippageError({
        msg: "Enter a valid slippage percentage.",
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
          className="text-icon-subdued hover:text-icon-default cursor-pointer"
          aria-label="Settings"
        >
          <GearIcon
            className={`transition ${expertMode ? "text-orange" : ""}`}
          />
        </a>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Settings</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <div className="flex items-center gap-1">
                <label className="text-sm">Expert Mode</label>
                <InfoTooltip
                  className="max-w-[250px]"
                  content="Allow high price impact trades and skip the confirm screen. Use at your own risk."
                />
              </div>
              <Switch
                checked={expertMode}
                onCheckedChange={handleExpertModeChange}
              />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-1">
              <label className="text-sm">Slippage Tolerance</label>
              <InfoTooltip
                className="max-w-[250px]"
                content="Your transaction will revert if the price changes unfavorably by more than this percentage."
              />
            </div>
            <div className="flex justify-between gap-2">
              <Button
                className="h-10"
                disabled={!expertMode}
                onClick={() => setCustomSlippage(defaultSlippageTolerance)}
              >
                Auto
              </Button>
              <div className="flex-1">
                <Input
                  disabled={!expertMode}
                  type="number"
                  value={customSlippage}
                  onChange={handleCustomSlippageChange}
                  placeholder={formatNumber(defaultSlippageTolerance, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                  className="normalize-input text-right"
                  endAdornment={<span>%</span>}
                />
              </div>
            </div>
          </div>
          {slippageError && (
            <div className="h-4">
              <p
                className={`text-sm ${slippageError.error ? "text-danger" : "text-orange"}`}
              >
                {slippageError.msg}
              </p>
            </div>
          )}
        </div>
      </PopoverContent>

      <AlertDialog
        open={showExpertModeDialog}
        onOpenChange={setShowExpertModeDialog}
      >
        <AlertDialogContent className="bg-surface-2 border-stroke-default">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              Expert mode turns off the confirm transaction prompt and allows
              high slippage trades that often result in bad rates and lost
              funds.
            </AlertDialogDescription>
            <AlertDialogDescription className="text-warning">
              Only use this mode if you know what you are doing.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
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
