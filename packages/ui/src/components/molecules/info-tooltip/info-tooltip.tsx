"use client";

import { useState } from "react";
import { InfoIcon } from "../../../icons";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../atoms";

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
        <TooltipContent side={side}>{content}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
