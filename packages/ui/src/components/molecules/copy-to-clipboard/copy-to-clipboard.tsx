"use client";

import React, { useCallback, useMemo, useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../atoms";

interface CopyToClipboardProps extends React.PropsWithChildren {
  value: string;
  content?: React.ReactNode;
  side?: "left" | "right" | "top" | "bottom" | undefined;
}

export const CopyToClipboard = ({
  value,
  side,
  content,
  ...props
}: CopyToClipboardProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const onCopy = useCallback(() => {
    console.log("Copying to clipboard:", value);
    navigator.clipboard.writeText(value);
  }, [value]);

  // TODO: Call existing events, if any, before we overwrite.
  const children = useMemo(() => {
    return React.cloneElement(props.children as React.ReactElement, {
      onClick: onCopy,
      onMouseEnter: () => setIsOpen(true),
      onMouseLeave: () => setIsOpen(false),
    });
  }, [onCopy, props.children]);

  if (!content) {
    return children;
  }

  return (
    <TooltipProvider>
      <Tooltip open={isOpen} onOpenChange={setIsOpen}>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent side={side || "top"}>{content}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
