"use client";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
  Switch,
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogCancel,
  AlertDialogAction,
} from "@repo/ui/shadcn-primitives";
import { GearIcon } from "@repo/ui/icons";
import { InfoTooltip } from "@repo/ui/components";
import { useState } from "react";
import { getFromLocalStorage, setInLocalStorage } from "utils/utils";
import { defaultSlippageTolerance } from "../../constants";

export const SettingsPopover = () => {
  const currentSettings = getFromLocalStorage("settings") || {};
  const [customSlippage, setCustomSlippage] = useState<string>(currentSettings?.slippageTolerance?.toString() || defaultSlippageTolerance.toString());
  const [expertMode, setExpertMode] = useState(currentSettings?.expertMode || false);
  const [showExpertModeDialog, setShowExpertModeDialog] = useState(false);


  // TODO: add in whatever validation is needed for the slippage tolerance
  const handleCustomSlippageChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const value = e.target.value;
    setCustomSlippage(value);
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue > 0) {
      setInLocalStorage("settings", { ...currentSettings, slippageTolerance: numValue });
    }
  };

  const handleExpertModeChange = () => {
    if (!expertMode) {
      setShowExpertModeDialog(true);
    } else {
      setExpertMode(false);
      setCustomSlippage("0.10");
      setInLocalStorage("settings", { ...currentSettings, expertMode: false, slippageTolerance: 0.10 });
    }
  };

  return (
    <Popover>
      <PopoverTrigger>
        <a className="text-grey-light hover:text-white" aria-label="Settings">
          <GearIcon
            className={`transition ${expertMode ? 'stroke-orange-soft' : ''}`}
          />
        </a>
      </PopoverTrigger>
      <PopoverContent className="w-80 bg-radial-dark border-border" align="end">
        <div className="space-y-4">
          <h2 className="text-md font-semibold text-white">Settings</h2>
          <div className="space-y-2">
            <div className="flex items-center gap-1">
              <label className="text-sm text-white">Slippage Tolerance</label>
              <InfoTooltip content="Your transaction will revert if the price changes unfavorably by more than this percentage." />
            </div>
            <div className="flex justify-between">
              {/* TODO: have auto button actually have logic to find whatever slippage is best */}
              <button className="text-sm text-white bg-accent px-3 py-1 rounded-sm mr-2" onClick={() => setCustomSlippage("0.10")}>
                Auto
              </button>
              <div className="flex-1 relative">
                <input
                  type="number"
                  value={customSlippage}
                  onChange={handleCustomSlippageChange}
                  placeholder="0.10"
                  className="w-full px-3 py-1 pr-7 bg-grey-dark rounded-sm text-white text-right placeholder:text-grey-light placeholder:text-right focus:outline-none focus:ring-1 focus:ring-primary normalize-input"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white">
                  %
                </span>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <h2 className="text-md font-semibold text-white">
              Interface Settings
            </h2>
            <div className="flex justify-between">
              <div className="flex items-center gap-1">
                <label className="text-sm text-white">Expert Mode</label>
                <InfoTooltip content="Allow high price impact trades and skip the confirm screen. Use at your own risk." />
              </div>
              <Switch
                checked={expertMode}
                onCheckedChange={handleExpertModeChange}
                className="h-7 w-12 data-[state=unchecked]:bg-grey-light data-[state=checked]:bg-accent [&>span]:h-6 [&>span]:w-6 [&>span[data-state=checked]]:translate-x-5"
              />
            </div>
          </div>
        </div>
      </PopoverContent>

      <AlertDialog
        open={showExpertModeDialog}
        onOpenChange={setShowExpertModeDialog}
      >
        <AlertDialogContent className="bg-radial-dark border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">
              Are you sure?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-grey-light">
              Expert mode turns off the confirm transaction prompt and allows
              high slippage trades that often result in bad rates and lost
              funds.
            </AlertDialogDescription>
            <AlertDialogTitle className="text-white">
              ONLY USE THIS MODE IF YOU KNOW WHAT YOU ARE DOING.
            </AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-grey-dark text-white hover:bg-grey-light">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-accent text-white hover:bg-accent/90"
              onClick={() => {
                setExpertMode(true);
                setInLocalStorage("settings", { ...currentSettings, expertMode: true });
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
