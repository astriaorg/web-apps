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
  const [hasCopied, setHasCopied] = useState(false);

  const onCopy = useCallback(() => {
    navigator.clipboard.writeText(value);
  }, [value]);

  // TODO: Call existing events, if any, before we overwrite.
  // TODO: Fix janky animations on hovering over the border of the trigger.
  const children = useMemo(() => {
    return React.cloneElement(props.children as React.ReactElement, {
      onClick: () => {
        onCopy();
        setHasCopied(true);
        setIsOpen(true);

        setTimeout(() => setIsOpen(false), 2500);
      },
      onMouseEnter: () => {
        setHasCopied(false);
        setIsOpen(true);
      },
      onMouseLeave: () => setIsOpen(false),
    });
  }, [onCopy, props.children]);

  const tooltipContent = useMemo(() => {
    if (hasCopied) {
      return <span className="text-success">Copied!</span>;
    }
    return content;
  }, [hasCopied, content]);

  if (!content) {
    return children;
  }

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
            {children}
          </TooltipTrigger>
          <TooltipContent side={side || "top"}>{tooltipContent}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};
