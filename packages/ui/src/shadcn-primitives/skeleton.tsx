import * as React from "react";

import { cn } from "../lib/utils";

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
          "animate-pulse rounded-sm bg-surface-3 *:invisible",
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
