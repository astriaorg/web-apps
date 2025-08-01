import { motion, type Transition } from "motion/react";
import { useCallback, useState } from "react";

import { Button, type ButtonProps } from "@repo/ui/components";
import { SwapVerticalIcon } from "@repo/ui/icons";
import { cn } from "@repo/ui/utils";

export const SWAP_BUTTON_TRANSITION: Transition = {
  duration: 0.1,
  type: "spring",
  damping: 30,
  stiffness: 500,
};

const CornerMask = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("absolute text-background-default", className)}
      {...props}
    >
      <path
        d="M0 0V32C1.64734 27.3392 6.0923 24 11.3172 24H31.9999L32 8.00002H11.3177C6.09285 8.00002 1.64734 4.66078 0 0Z"
        fill="currentColor"
      />
    </svg>
  );
};

interface SwapButtonProps extends ButtonProps {
  icon?: React.ReactNode;
}

export const SwapButton = ({
  icon = <SwapVerticalIcon />,
  className,
  onClick,
  ...props
}: SwapButtonProps) => {
  const [isRotated, setIsRotated] = useState(false);

  const handleClick = useCallback<React.MouseEventHandler<HTMLButtonElement>>(
    (event) => {
      setIsRotated((prev) => !prev);
      onClick?.(event);
    },
    [onClick],
  );

  return (
    <div className="relative flex items-center justify-center z-10">
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
      <CornerMask className="left-0" />
      <div className="w-full h-4 bg-background-default" />
      <CornerMask className="right-0 scale-x-[-1]" />
      <Button
        className={cn(
          "absolute rounded-full w-10 h-10 [&_svg]:size-6",
          className,
        )}
        onClick={handleClick}
        {...props}
      >
        <motion.div
          animate={{ scaleY: isRotated ? -1 : 1 }}
          transition={{ duration: 0.2 }}
        >
          {icon}
        </motion.div>
      </Button>
    </div>
  );
};
