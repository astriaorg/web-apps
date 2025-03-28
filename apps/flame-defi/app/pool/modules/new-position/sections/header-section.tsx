"use client";

import { ArrowLeftIcon } from "@repo/ui/icons";
import { SettingsPopover } from "components/settings-popover/settings-popover";
import { useRouter } from "next/navigation";

export const HeaderSection = () => {
  const router = useRouter();

  return (
    <div className="flex items-baseline relative">
      <div
        onClick={() => router.back()}
        className="mb-10 md:absolute md:-left-10 md:mt-2 md:mb-0"
      >
        <ArrowLeftIcon
          aria-label="Back"
          size={16}
          className="cursor-pointer text-icon-light hover:text-white transition"
        />
      </div>
      <div className="flex items-center justify-between w-full">
        <h1 className="text-3xl/8">New Position</h1>
        <SettingsPopover />
      </div>
    </div>
  );
};
