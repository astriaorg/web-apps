import * as React from "react";

import { cn } from "../../utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  isLoading?: boolean;
}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ children, className, isLoading = true }, forwardedRef) => {
    if (!isLoading) {
      return children;
    }

    return (
      <div
        ref={forwardedRef}
        aria-hidden
        className={cn(
          "animate-shimmer rounded-lg opacity-5 bg-typography-default/40 bg-[linear-gradient(270deg,transparent_20%,transparent_40%,var(--color-typography-default)_50%,var(--color-typography-default)_55%,transparent_70%,transparent_100%)] bg-[length:300%_100%] transition-colors *:invisible",
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
