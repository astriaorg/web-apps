import { Button } from "@repo/ui/components";

type SubmitButtonProps = {
  onClick: () => void;
  isLoading: boolean;
  isDisabled: boolean;
  buttonText: string;
  loadingText?: string;
  className?: string;
};

export const SubmitButton = ({
  onClick,
  isLoading,
  isDisabled,
  buttonText,
  loadingText = "Processing...",
  className = "w-full",
}: SubmitButtonProps) => {
  return (
    <div className="flex flex-col gap-3 mt-8">
      <div className="w-full">
        <Button
          variant="gradient"
          onClick={onClick}
          disabled={isDisabled || isLoading}
          className={className}
        >
          {isLoading ? loadingText : buttonText}
        </Button>
      </div>
    </div>
  );
};
