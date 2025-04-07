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
  side?: React.ComponentPropsWithoutRef<typeof TooltipContent>["side"];
}

export const CopyToClipboard = ({
  value,
  side,
  content,
  ...props
}: CopyToClipboardProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasCopied, setHasCopied] = useState(false);

  const onCopy = useCallback(() => {
    navigator.clipboard.writeText(value);
  }, [value]);

  const tooltipContent = useMemo(() => {
    if (hasCopied) {
      return <span className="text-success">Copied!</span>;
    }
    return content ?? "Copy";
  }, [hasCopied, content]);

  return (
    <div
      // Fixes tooltip automatically opening when page is focused.
      // Ref: https://github.com/radix-ui/primitives/issues/2248
      onFocusCapture={(e) => {
        e.stopPropagation();
      }}
    >
      <TooltipProvider>
        <Tooltip open={isOpen} onOpenChange={setIsOpen}>
          <TooltipTrigger asChild onClick={() => setIsOpen(true)}>
            <div
              onClick={() => {
                onCopy();
                setHasCopied(true);
                setIsOpen(true);
                setTimeout(() => {
                  setIsOpen(false);
                }, 2500);
              }}
              onMouseEnter={() => {
                setIsOpen(true);
              }}
              onMouseLeave={() => {
                setHasCopied(false);
              }}
            >
              {props.children}
            </div>
          </TooltipTrigger>
          <TooltipContent side={side || "top"}>{tooltipContent}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};
