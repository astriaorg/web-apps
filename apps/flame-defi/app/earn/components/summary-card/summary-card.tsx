import { cn } from "@repo/ui/lib";
import { Card } from "earn/components/card";
import { SummaryCardContext } from "earn/components/summary-card";
import React from "react";

interface SummaryCardProps extends React.HTMLAttributes<HTMLSpanElement> {
  isLoading: boolean;
}

export const SummaryCard = ({
  className,
  isLoading,
  ...props
}: SummaryCardProps) => {
  return (
    <SummaryCardContext.Provider value={{ isLoading }}>
      <Card
        className={cn("flex flex-col space-y-2 p-6", className)}
        {...props}
      />
    </SummaryCardContext.Provider>
  );
};
