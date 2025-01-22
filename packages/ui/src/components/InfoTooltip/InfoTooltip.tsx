"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../shadcn-primitives";
import { InfoIcon } from "../../icons";
import { useState } from "react";

interface InfoTooltipProps {
  content: string;
  side?: "left" | "right" | "top" | "bottom" | undefined;
}

export const InfoTooltip: React.FC<InfoTooltipProps> = ({
  content,
  side,
}: InfoTooltipProps) => {
  const [open, setOpen] = useState(false);

  return (
    <TooltipProvider>
      <Tooltip open={open} onOpenChange={setOpen}>
        <TooltipTrigger asChild>
          <span onClick={() => setOpen(!open)}>
            <InfoIcon
              size={16}
              className="text-grey-light hover:text-white cursor-pointer"
            />
          </span>
        </TooltipTrigger>
        <TooltipContent
          className="bg-black text-white border border-border rounded-md px-3 py-2 max-w-[200px] text-[14px]"
          sideOffset={5}
          side={side || "left"}
        >
          {content}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
