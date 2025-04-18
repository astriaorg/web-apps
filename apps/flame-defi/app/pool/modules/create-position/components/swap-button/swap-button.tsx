import { Button, type ButtonProps } from "@repo/ui/components";
import { SwapVerticalIcon } from "@repo/ui/icons";
import { cn } from "@repo/ui/utils";
import { motion } from "motion/react";
import { useCallback, useState } from "react";

export const SwapButton = ({ className, onClick, ...props }: ButtonProps) => {
  const [isRotated, setIsRotated] = useState(false);

  const handleClick = useCallback<React.MouseEventHandler<HTMLButtonElement>>(
    (event) => {
      setIsRotated((prev) => !prev);
      onClick?.(event);
    },
    [onClick],
  );

  return (
    <div className="relative flex items-center justify-center">
      <div className="absolute">
        <svg
          width="153"
          height="61"
          viewBox="0 0 153 61"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M99.0693 51.7652C92.817 57.6899 84.6211 60.6504 76.4264 60.6467C68.1573 60.7049 59.869 57.7447 53.5597 51.766C47.4387 45.9658 41.453 37.9052 4.68645 37.9052C-1.56214 37.9052 -1.56214 22.743 4.68645 22.743C41.4526 22.743 47.9283 14.2187 53.5597 8.88234C59.812 2.95759 68.008 -0.00290962 76.2027 0.000845428C84.4718 -0.0573621 92.7601 2.90286 99.0693 8.8815C105.19 14.6818 103.175 22.7424 147.943 22.7424C154.191 22.7424 154.191 37.9045 147.943 37.9045C107.176 37.9045 104.701 46.4289 99.0693 51.7652Z"
            fill="currentColor"
            className="text-background-default"
          />
        </svg>
      </div>
      <Button
        size="icon"
        className={cn("absolute rounded-full [&_svg]:size-6", className)}
        onClick={handleClick}
        {...props}
      >
        <motion.div
          transition={{ duration: 0.5 }}
          animate={{ rotate: isRotated ? 0 : 180 }}
        >
          <SwapVerticalIcon />
        </motion.div>
      </Button>
    </div>
  );
};
