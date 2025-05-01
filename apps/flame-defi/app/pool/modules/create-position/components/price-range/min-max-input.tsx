import { TokenAmountInput, type InputProps } from "@repo/ui/components";

interface MinMaxInputProps extends InputProps {
  label: React.ReactNode;
}

export const MinMaxInput = ({ label, ...props }: MinMaxInputProps) => {
  return (
    <TokenAmountInput
      className="pl-14 text-right"
      startAdornment={
        <span className="text-sm text-typography-subdued font-medium">
          {label}
        </span>
      }
      {...props}
    />
  );
};
