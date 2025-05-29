import { motion } from "motion/react";

import { cn } from "../../../utils";
import { AnimatedNumberColumn } from "./animated-number-column";

interface AnimatedNumberProps
  extends React.ComponentPropsWithoutRef<typeof motion.div> {
  value: number;
  /**
   * The width of each digit.
   */
  width: number;
  /**
   * The height of each digit.
   */
  height: number;
}

export const AnimatedNumber = ({
  value,
  width,
  height,
  className,
  style,
  ...props
}: AnimatedNumberProps) => {
  const numberAsString = [...String(value)];

  return (
    <motion.div
      animate={{ width: width * numberAsString.length }}
      transition={{ duration: 0.2 }}
      className={cn("flex overflow-hidden relative", className)}
      style={{ height, ...style }}
      {...props}
    >
      {numberAsString.map((number, index) => (
        <AnimatedNumberColumn
          value={number}
          key={`animated-number_${index}`}
          width={width}
          height={height}
        />
      ))}
    </motion.div>
  );
};
