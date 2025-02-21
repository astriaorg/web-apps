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
          "animate-shimmer rounded-lg opacity-10 bg-text/20 bg-[linear-gradient(270deg,transparent_20%,transparent_40%,hsl(var(--color-text-default)/0.3)_50%,hsl(var(--color-text-default)/0.2)_55%,transparent_70%,transparent_100%)] bg-[length:600%_100%] transition-colors *:invisible",
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
