import { motion } from "motion/react";

interface AnimatedNumberColumnProps {
  value: string;
  width: number;
  height: number;
}

const NUMBERS = [0, 9, 8, 7, 6, 5, 4, 3, 2, 1];

export const AnimatedNumberColumn = ({
  value,
  width,
  height,
}: AnimatedNumberColumnProps) => {
  const index = NUMBERS.findIndex((number) => number === Number(value));

  return (
    <motion.div
      animate={{ y: -height * index }}
      transition={{ ease: "easeOut", duration: 0.15 }}
      style={{ height: height * 10 }}
      className="flex flex-col"
    >
      {NUMBERS.map((number, index) => (
        <div
          key={`animated-number-column_${index}`}
          className="flex justify-center items-center"
          style={{ height: `${height}px`, width: `${width}px` }}
        >
          {number}
        </div>
      ))}
    </motion.div>
  );
};
