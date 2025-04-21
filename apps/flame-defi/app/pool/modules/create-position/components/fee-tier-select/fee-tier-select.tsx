import { CheckCircleIcon } from "@repo/ui/icons";
import { cn } from "@repo/ui/utils";
import { FEE_TIER, FEE_TIERS, type FeeTier } from "pool/constants";
import { useIntl } from "react-intl";

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

interface FeeTierSelectProps {
  value: FeeTier;
  onChange: (value: FeeTier) => void;
}

export const FeeTierSelect = ({ value, onChange }: FeeTierSelectProps) => {
  const { formatNumber } = useIntl();

  return (
    <div className="flex flex-col gap-1">
      {FEE_TIERS.map((it) => (
        <div
          key={`fee-tier-select_${it}`}
          className={cn(
            "w-full flex bg-surface-2 items-center justify-between border border-solid border-transparent rounded-xl p-4 cursor-pointer transition",
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
            <span className="font-medium flex items-center w-20 mx-4">
              {formatNumber(it / 1_000_000, {
                style: "percent",
                minimumFractionDigits: 1,
                maximumFractionDigits: 2,
              })}
            </span>
            <span className="text-typography-subdued text-xs font-medium">
              {DATA[it].label}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};
