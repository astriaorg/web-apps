import { useEffect } from "react";

interface Params {
  /**
   * The value to animate to.
   */
  value: number;
  setCounter: (value: number) => void;
}

export function useAnimateCounter({ value, setCounter }: Params): void {
  useEffect(() => {
    let isMounted = true;

    const counter = (minimum: number, maximum: number) => {
      let i = minimum;

      const updateCount = () => {
        if (isMounted && i <= maximum) {
          setCounter(i);

          // Increment counter based on proximity to maximum so multiple cards have synced animations.
          const range = maximum - minimum;
          const progress = (i - minimum) / range;
          const step = Math.max(1, (Math.log10(1 + 9 * progress) * range) / 10);

          i += Math.ceil(step);

          setTimeout(updateCount, 10);
        }

        if (isMounted && i > maximum) {
          setCounter(maximum);
        }
      };

      updateCount();

      return () => {
        isMounted = false;
      };
    };

    counter(0, value);

    return () => {
      isMounted = false;
    };
  }, [value, setCounter]);
}
