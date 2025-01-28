"use client";

import { useConfig } from "../../config/hooks/useConfig";
import { UpRightSquareIcon } from "@repo/ui/icons";

interface SideTagProps {
  label: string;
}

/**
 * SideTag component to render a side tag with an icon and label.
 * @param label
 */

export const SideTag = ({ label }: SideTagProps) => {
  const { feedbackFormURL } = useConfig();

  return (
    <div className="hidden md:inline-flex items-center absolute top-1/2 right-0 bg-orange-soft text-white text-xs font-bold translate-x-10 -rotate-90 overflow-hidden">
      <a
        href={feedbackFormURL || ""}
        target="_blank"
        rel="noreferrer"
        className="flex items-center gap-2 transition px-3 py-2 text-white hover:bg-black/10 text-base"
      >
        <span className="w-5 h-5 flex items-center justify-center">
          <UpRightSquareIcon />
        </span>
        <span>{label}</span>
      </a>
    </div>
  );
};
