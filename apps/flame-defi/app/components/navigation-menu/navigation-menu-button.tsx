import { motion, type SVGMotionProps } from "motion/react";

interface NavigationMenuButtonProps extends SVGMotionProps<SVGSVGElement> {
  isOpen?: boolean;
  size?: number;
}

export const NavigationMenuButton = ({
  isOpen = false,
  size = 24,
  ...props
}: NavigationMenuButtonProps) => {
  const variant = isOpen ? "opened" : "closed";

  const top = {
    closed: {
      rotate: 0,
      translateY: 0,
    },
    opened: {
      rotate: 45,
      translateY: 0.75,
    },
  };
  const bottom = {
    closed: {
      rotate: 0,
      translateY: 0,
    },
    opened: {
      rotate: -45,
      translateY: -0.75,
    },
  };

  const line = {
    stroke: "currentColor",
    strokeWidth: 2,
    vectorEffect: "non-scaling-stroke",
    initial: "closed",
    animate: variant,
    transition: { ease: "easeOut", duration: 0.5 },
  };

  const viewBoxHeight = 4;
  const viewBoxWidth = (viewBoxHeight * (size as number)) / (size as number);

  return (
    <motion.svg
      viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
      overflow="visible"
      width={size}
      height={size}
      {...props}
    >
      <motion.line
        x1="0"
        x2={viewBoxWidth}
        // Default: 0 -> 2
        y1="1.25"
        y2="1.25"
        variants={top}
        {...line}
      />
      <motion.line
        x1="0"
        x2={viewBoxWidth}
        // Default: 4 -> -2
        y1="2.75"
        y2="2.75"
        variants={bottom}
        {...line}
      />
    </motion.svg>
  );
};
