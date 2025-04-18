import { CheckCircleIcon } from "@repo/ui/icons";
import { cn } from "@repo/ui/utils";
import { FEE_TIER, type FeeTier } from "pool/constants/pool-constants";
import { useIntl } from "react-intl";

export interface FeeTierSelectProps {
  value: FeeTier;
  onChange: (value: FeeTier) => void;
}

const TIERS = [FEE_TIER.LOWEST, FEE_TIER.LOW, FEE_TIER.MEDIUM, FEE_TIER.HIGH];

const DATA: { [key in FeeTier]: { label: string } } = {
  [FEE_TIER.LOWEST]: {
    label: "Best for very stable pairs.",
  },
  [FEE_TIER.LOW]: {
    label: "Best for stable pairs.",
  },
  [FEE_TIER.MEDIUM]: {
    label: "Best for most pairs.",
  },
  [FEE_TIER.HIGH]: {
    label: "Best for exotic pairs.",
  },
};

export const FeeTierSelect = ({ value, onChange }: FeeTierSelectProps) => {
  const { formatNumber } = useIntl();

  return (
    <div className="flex flex-col gap-1">
      {TIERS.map((it, index) => (
        <div
          key={`fee-tier-select_${index}`}
          className={cn(
            "w-full flex bg-surface-1 items-center justify-between border border-solid border-transparent rounded-xl p-4 cursor-pointer transition",
            it === value && "border-orange",
          )}
          onClick={() => onChange(it)}
        >
          <div className="flex items-center">
            <CheckCircleIcon
              size={18}
              className={cn(
                "text-orange",
                it === value ? "opacity-100" : "opacity-0",
              )}
            />
            <span className="text-white font-medium flex items-center w-24 mx-4">
              {formatNumber(it / 1_000_000, {
                style: "percent",
                minimumFractionDigits: 1,
                maximumFractionDigits: 2,
              })}
            </span>
            <span className="text-typography-subdued text-sm">
              {DATA[it].label}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};
