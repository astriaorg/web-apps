import { cva, type VariantProps } from "class-variance-authority";
import { useMemo } from "react";

import { TableIcon, WarningTriangleIcon } from "../../../icons";
import { cn } from "../../../utils";
import { Card, type CardProps } from "../card";

export const statusCardVariants = cva("", {
  variants: {
    status: {
      default: "",
      error: "text-typography-subdued",
      empty: "text-typography-subdued",
      success: "text-typography-subdued",
    },
  },
  defaultVariants: {
    status: "default",
  },
});

interface StatusCardProps
  extends CardProps,
    VariantProps<typeof statusCardVariants> {}

export const StatusCard = ({
  children,
  className,
  status,
  ...props
}: StatusCardProps) => {
  const icon = useMemo(() => {
    // TODO: Handle other icons.
    if (status === "empty") {
      return <TableIcon className="w-10 h-10 mb-6 text-icon-subdued" />;
    }
    if (status === "error") {
      return <WarningTriangleIcon className="w-10 h-10 mb-6 text-danger" />;
    }

    return null;
  }, [status]);

  return (
    <Card
      className={cn(
        "min-h-100 flex items-center justify-center p-12 text-sm",
        statusCardVariants({ status }),
        className,
      )}
      {...props}
    >
      {icon}
      {children}
    </Card>
  );
};
