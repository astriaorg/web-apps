import * as React from "react";

import { cn } from "../utils";

interface SkeletonProps extends React.PropsWithChildren {
  className?: string;
  isLoading?: boolean;
}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ children, className, isLoading }, forwardedRef) => {
    if (!isLoading) {
      return children;
    }

    return (
      <div
        ref={forwardedRef}
        aria-hidden
        className={cn(
          "animate-shimmer rounded-lg bg-[linear-gradient(270deg,hsl(var(--color-surface-1)),35%,hsl(var(--color-surface-2)),55%,hsl(var(--color-surface-1)))] bg-[length:600%_100%] transition-colors *:invisible",
          className,
        )}
      >
        {children}
      </div>
    );
  },
);

Skeleton.displayName = "Skeleton";

export { Skeleton };
export type { SkeletonProps };
